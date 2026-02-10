import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Submit lesson completion with skill-based tracking
 * Handles retry penalty and updates skill arrays
 */
export const submitLesson = mutation({
    args: {
        userId: v.string(),
        skill: v.union(
            v.literal("reading_writing"),
            v.literal("speaking"),
            v.literal("grammar"),
            v.literal("vocabulary")
        ),
        lessonOrder: v.number(),
        score: v.number(),
        skillPointsEarned: v.number(),
        xpEarned: v.number(),
    },
    handler: async (ctx, args) => {
        // Get user profile
        const user = await ctx.db
            .query("user_profiles")
            .withIndex("by_user_id", (q) => q.eq("user_id", args.userId))
            .unique();

        if (!user) throw new Error("User not found");

        // Initialize lessons_completed_by_skill if not exists
        const lessonsCompleted = user.lessons_completed_by_skill || {
            reading_writing: [],
            speaking: [],
            grammar: [],
            vocabulary: [],
        };

        // Check if already completed (for retry penalty)
        const isRetry = lessonsCompleted[args.skill].includes(args.lessonOrder);

        // Retry penalty: 50% points on 2nd attempt, 25% on 3rd, 0% after that
        let pointMultiplier = 1.0;
        if (isRetry) {
            const completionCount = lessonsCompleted[args.skill].filter(
                (order) => order === args.lessonOrder
            ).length;

            if (completionCount === 1) pointMultiplier = 0.5; // 2nd attempt
            else if (completionCount === 2) pointMultiplier = 0.25; // 3rd attempt
            else pointMultiplier = 0; // 4th+ attempt
        }

        // Add to completed array if first time (allow duplicates for retry tracking)
        if (!isRetry) {
            lessonsCompleted[args.skill].push(args.lessonOrder);
        }

        // Calculate final points
        const finalSkillPoints = Math.floor(args.skillPointsEarned * pointMultiplier);
        const finalXP = Math.floor(args.xpEarned * pointMultiplier);

        // Update user profile
        const currentSkillPoints = user.skill_vector?.[args.skill] || 0;

        await ctx.db.patch(user._id, {
            skill_vector: {
                ...user.skill_vector,
                [args.skill]: currentSkillPoints + finalSkillPoints,
            },
            total_xp: user.total_xp + finalXP,
            lessons_completed_by_skill: lessonsCompleted,
            lessons_completed: user.lessons_completed + (isRetry ? 0 : 1), // Only increment on first completion
            last_active_date: new Date().toISOString(),
        });

        return {
            success: true,
            isRetry,
            pointsEarned: finalSkillPoints,
            xpEarned: finalXP,
            multiplier: pointMultiplier,
            newSkillLevel: currentSkillPoints + finalSkillPoints,
        };
    },
});

/**
 * Get user's completed lessons grouped by skill
 */
export const getCompletedLessonsBySkill = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("user_profiles")
            .withIndex("by_user_id", (q) => q.eq("user_id", args.userId))
            .unique();

        if (!user) return null;

        return user.lessons_completed_by_skill || {
            reading_writing: [],
            speaking: [],
            grammar: [],
            vocabulary: [],
        };
    },
});

/**
 * Check if a specific lesson has been completed
 */
export const isLessonCompleted = query({
    args: {
        userId: v.string(),
        skill: v.union(
            v.literal("reading_writing"),
            v.literal("speaking"),
            v.literal("grammar"),
            v.literal("vocabulary")
        ),
        lessonOrder: v.number(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("user_profiles")
            .withIndex("by_user_id", (q) => q.eq("user_id", args.userId))
            .unique();

        if (!user) return false;

        const completed = user.lessons_completed_by_skill?.[args.skill] || [];
        return completed.includes(args.lessonOrder);
    },
});

/**
 * Get completion statistics for a user
 */
export const getCompletionStats = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("user_profiles")
            .withIndex("by_user_id", (q) => q.eq("user_id", args.userId))
            .unique();

        if (!user) return null;

        const completed = user.lessons_completed_by_skill || {
            reading_writing: [],
            speaking: [],
            grammar: [],
            vocabulary: [],
        };

        // Get total lessons per skill
        const rwTotal = await ctx.db.query("lessons_reading_writing").collect();
        const speakingTotal = await ctx.db.query("lessons_speaking").collect();
        const grammarTotal = await ctx.db.query("lessons_grammar").collect();
        const vocabTotal = await ctx.db.query("lessons_vocabulary").collect();

        return {
            reading_writing: {
                completed: completed.reading_writing.length,
                total: rwTotal.length,
                percentage: Math.round((completed.reading_writing.length / rwTotal.length) * 100) || 0,
            },
            speaking: {
                completed: completed.speaking.length,
                total: speakingTotal.length,
                percentage: Math.round((completed.speaking.length / speakingTotal.length) * 100) || 0,
            },
            grammar: {
                completed: completed.grammar.length,
                total: grammarTotal.length,
                percentage: Math.round((completed.grammar.length / grammarTotal.length) * 100) || 0,
            },
            vocabulary: {
                completed: completed.vocabulary.length,
                total: vocabTotal.length,
                percentage: Math.round((completed.vocabulary.length / vocabTotal.length) * 100) || 0,
            },
            overall: {
                completed: user.lessons_completed,
                total: rwTotal.length + speakingTotal.length + grammarTotal.length + vocabTotal.length,
            },
        };
    },
});
