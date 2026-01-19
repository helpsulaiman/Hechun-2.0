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

// UPDATE Progress (Finish Lesson)
export const completeLesson = mutation({
    args: {
        user_id: v.string(),
        lesson_id: v.number(),
        score: v.number(),
    },
    handler: async (ctx, args) => {
        // Check if progress already exists
        const existing = await ctx.db
            .query("lesson_progress")
            .withIndex("by_user_lesson", (q) =>
                q.eq("user_id", args.user_id).eq("lesson_id", args.lesson_id)
            )
            .unique();

        const now = new Date().toISOString();

        if (existing) {
            // Update logic (e.g., only update if score is higher, or just overwrite)
            await ctx.db.patch(existing._id, {
                score: args.score, // Or Math.max(existing.score, args.score)
                completed_at: now,
            });
            return existing._id;
        } else {
            // Create new progress entry
            const newId = await ctx.db.insert("lesson_progress", {
                user_id: args.user_id,
                lesson_id: args.lesson_id,
                score: args.score,
                completed_at: now,
            });

            // OPTIONAL: Update User Stats (XP, Lessons Completed)
            // fetch user -> increment lessons_completed, total_xp
            const user = await ctx.db
                .query("user_profiles")
                .withIndex("by_user_id", (q) => q.eq("user_id", args.user_id))
                .unique();

            if (user) {
                await ctx.db.patch(user._id, {
                    lessons_completed: user.lessons_completed + 1,
                    // total_xp: user.total_xp + 10 (Fetch lesson XP if needed, simple increment for now)
                });
            }

            return newId;
        }
    },
});
