import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// GET User Progress
export const getUserProgress = query({
    args: { user_id: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("lesson_progress")
            .withIndex("by_user", (q) => q.eq("user_id", args.user_id))
            .collect();
    },
});

/**
 * Submit lesson completion with full calculations
 * Handles: retakes, streak tracking, XP, and skill updates
 */
export const submitLesson = mutation({
    args: {
        userId: v.string(),
        lessonId: v.number(),
        score: v.number(), // 0.0 - 1.0
        skillsEarned: v.optional(
            v.object({
                reading_writing: v.optional(v.number()),
                speaking: v.optional(v.number()),
                grammar: v.optional(v.number()),
                vocabulary: v.optional(v.number()),
            })
        ),
    },
    handler: async (ctx, args) => {
        // Get user profile
        const user = await ctx.db
            .query("user_profiles")
            .withIndex("by_user_id", (q) => q.eq("user_id", args.userId))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        // Calculate retake penalty
        const completionCount = await ctx.db
            .query("lesson_progress")
            .withIndex("by_user_lesson", (q) =>
                q.eq("user_id", args.userId).eq("lesson_id", args.lessonId)
            )
            .collect();

        let gainFactor = 1.0;
        if (completionCount.length === 1) gainFactor = 0.15;
        else if (completionCount.length === 2) gainFactor = 0.05;
        else if (completionCount.length >= 3) gainFactor = 0.0;

        // Calculate streak (UTC-based)
        const now = new Date();
        const lastActive = user.last_active_date ? new Date(user.last_active_date) : null;
        let newStreak = user.streak_days;

        if (lastActive) {
            const toDateStr = (d: Date) => d.toISOString().split('T')[0];
            const todayStr = toDateStr(now);
            const lastActiveStr = toDateStr(lastActive);

            const yesterday = new Date(now);
            yesterday.setUTCDate(now.getUTCDate() - 1);
            const yesterdayStr = toDateStr(yesterday);

            if (todayStr !== lastActiveStr) {
                if (lastActiveStr === yesterdayStr) {
                    newStreak += 1;
                } else {
                    newStreak = 1; // Broken streak
                }
            }
        } else {
            newStreak = 1; // First lesson
        }

        // Record progress
        const progressId = await ctx.db.insert("lesson_progress", {
            user_id: args.userId,
            lesson_id: args.lessonId,
            score: args.score,
            completed_at: now.toISOString(),
        });

        // Get all progress for XP calculation
        const allProgress = await ctx.db
            .query("lesson_progress")
            .withIndex("by_user", (q) => q.eq("user_id", args.userId))
            .collect();

        const lessonsCompleted = allProgress.filter((p) => p.score >= 0.6).length;
        const totalXP = Math.floor(
            allProgress.reduce((acc, p) => acc + p.score * 10, 0)
        );

        // Update skill vector if skills earned provided
        let newSkills = user.skill_vector || {
            reading_writing: 0,
            speaking: 0,
            grammar: 0,
            vocabulary: 0,
        };

        if (args.skillsEarned && gainFactor > 0) {
            // Apply earned skills with gain factor
            newSkills = {
                reading_writing:
                    (newSkills.reading_writing || 0) +
                    Math.ceil((args.skillsEarned.reading_writing || 0) * gainFactor),
                speaking:
                    (newSkills.speaking || 0) +
                    Math.ceil((args.skillsEarned.speaking || 0) * gainFactor),
                grammar:
                    (newSkills.grammar || 0) +
                    Math.ceil((args.skillsEarned.grammar || 0) * gainFactor),
                vocabulary:
                    (newSkills.vocabulary || 0) +
                    Math.ceil((args.skillsEarned.vocabulary || 0) * gainFactor),
            };
        }

        // Update user profile
        await ctx.db.patch(user._id, {
            lessons_completed: lessonsCompleted,
            total_xp: totalXP,
            streak_days: newStreak,
            skill_vector: newSkills,
            last_active_date: now.toISOString(),
        });

        return {
            success: true,
            progressId,
            xpEarned: Math.floor(args.score * 10 * gainFactor),
            newStreak,
            totalXP,
        };
    },
});
