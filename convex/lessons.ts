import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// GET All Lessons (Ordered)
export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("lessons")
            .withIndex("by_order") // Assumes you indexed this provided in schema
            .collect();
    },
});

// CREATE Lesson (Admin Only - simplified check for now)
export const create = mutation({
    args: {
        lesson_id: v.number(),
        lesson_order: v.number(),
        title: v.string(),
        description: v.optional(v.string()),
        content: v.any(),
        complexity: v.number(),
        skills_targeted: v.optional(v.any()), // JSON
        xp_reward: v.number(),
    },
    handler: async (ctx, args) => {
        // In production, check ctx.auth or pass an admin secret
        await ctx.db.insert("lessons", {
            lesson_id: args.lesson_id,
            lesson_order: args.lesson_order,
            title: args.title,
            description: args.description,
            content: args.content,
            complexity: args.complexity,
            skills_targeted: args.skills_targeted,
            xp_reward: args.xp_reward,
        });
    },
});
