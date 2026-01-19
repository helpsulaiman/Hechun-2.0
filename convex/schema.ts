import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Users (equivalent to UserProfile)
    user_profiles: defineTable({
        user_id: v.string(), // Links to Supabase Auth ID (indexed for speed)
        postgres_id: v.optional(v.string()), // Legacy ID from Postgres migration
        username: v.optional(v.string()),
        email: v.optional(v.string()),
        avatar_url: v.optional(v.string()),

        is_admin: v.boolean(),
        lessons_completed: v.number(),
        total_xp: v.number(),
        streak_days: v.number(),
        last_active_date: v.optional(v.string()),

        created_at: v.optional(v.string()),
        updated_at: v.optional(v.string()),

        // Skill Tracking
        skill_vector: v.optional(
            v.object({
                reading: v.number(),
                writing: v.optional(v.number()), // Made optional as some seed data misses it
                speaking: v.number(),
                grammar: v.optional(v.number()), // Made optional
                vocabulary: v.optional(v.number()), // Made optional
                listening: v.optional(v.number()), // ADDED: Found in seed data
            })
        ),
    }).index("by_user_id", ["user_id"]),

    // Lessons 
    lessons: defineTable({
        lesson_id: v.number(),
        lesson_order: v.number(),
        title: v.string(),
        description: v.optional(v.string()),
        content: v.any(),

        complexity: v.number(),
        skills_targeted: v.optional(v.any()),
        xp_reward: v.number(),
    }).index("by_order", ["lesson_order"]),

    // Lesson Progress
    lesson_progress: defineTable({
        user_id: v.string(),
        lesson_id: v.number(),

        score: v.number(),
        completed_at: v.string(),
    })
        .index("by_user_lesson", ["user_id", "lesson_id"])
        .index("by_user", ["user_id"]),
});
