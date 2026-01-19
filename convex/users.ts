import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// GET Profile
export const getUser = query({
    args: { user_id: v.string() },
    handler: async (ctx, args) => {
        // We use the `user_id` text field as the key, since we are syncing with Supabase Auth
        const user = await ctx.db
            .query("user_profiles")
            .withIndex("by_user_id", (q) => q.eq("user_id", args.user_id))
            .unique();

        return user;
    },
});

// CREATE or UPDATE Profile
export const upsertUser = mutation({
    args: {
        user_id: v.string(),
        username: v.optional(v.string()),
        email: v.optional(v.string()),
        avatar_url: v.optional(v.string()),

        // Optional updates
        skill_vector: v.optional(
            v.object({
                reading: v.number(),
                writing: v.number(),
                speaking: v.number(),
                grammar: v.number(),
                vocabulary: v.number(),
            })
        ),
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db
            .query("user_profiles")
            .withIndex("by_user_id", (q) => q.eq("user_id", args.user_id))
            .unique();

        const now = new Date().toISOString();

        if (existingUser) {
            // Update
            await ctx.db.patch(existingUser._id, {
                last_active_date: now,
                username: args.username ?? existingUser.username,
                email: args.email ?? existingUser.email,
                avatar_url: args.avatar_url ?? existingUser.avatar_url,
                skill_vector: args.skill_vector ?? existingUser.skill_vector,
            });
            return existingUser._id;
        } else {
            // Create
            const newId = await ctx.db.insert("user_profiles", {
                user_id: args.user_id,
                username: args.username,
                email: args.email,
                avatar_url: args.avatar_url,

                is_admin: false,
                lessons_completed: 0,
                total_xp: 0,
                streak_days: 0,
                last_active_date: now,

                skill_vector: args.skill_vector || {
                    reading: 0,
                    writing: 0,
                    speaking: 0,
                    grammar: 0,
                    vocabulary: 0,
                },
            });
            return newId;
        }
    },
});
