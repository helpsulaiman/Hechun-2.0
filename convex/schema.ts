import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Users (equivalent to UserProfile)
    user_profiles: defineTable({
        user_id: v.string(), // Links to Auth0 ID (indexed for speed)
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
                // New merged field
                reading_writing: v.optional(v.float64()),
                // Legacy fields (for backward compatibility during migration)
                reading: v.optional(v.float64()),
                writing: v.optional(v.float64()),
                // Common fields
                speaking: v.optional(v.float64()),
                grammar: v.optional(v.float64()),
                vocabulary: v.optional(v.float64()),
            })
        ),

        // Lesson Completion Tracking (skill-based arrays)
        lessons_completed_by_skill: v.optional(
            v.object({
                reading_writing: v.array(v.number()),
                speaking: v.array(v.number()),
                grammar: v.array(v.number()),
                vocabulary: v.array(v.number()),
            })
        ),
    })
        .index("by_user_id", ["user_id"])
        .index("by_email", ["email"]),

    // Skill-Specific Lesson Tables
    lessons_reading_writing: defineTable({
        lesson_order: v.number(),
        title: v.string(),
        description: v.optional(v.string()),
        content: v.any(),
        complexity: v.number(),
        xp_reward: v.number(),
    }).index("by_order", ["lesson_order"]),

    lessons_speaking: defineTable({
        lesson_order: v.number(),
        title: v.string(),
        description: v.optional(v.string()),
        content: v.any(),
        complexity: v.number(),
        xp_reward: v.number(),
    }).index("by_order", ["lesson_order"]),

    lessons_grammar: defineTable({
        lesson_order: v.number(),
        title: v.string(),
        description: v.optional(v.string()),
        content: v.any(),
        complexity: v.number(),
        xp_reward: v.number(),
    }).index("by_order", ["lesson_order"]),

    lessons_vocabulary: defineTable({
        lesson_order: v.number(),
        title: v.string(),
        description: v.optional(v.string()),
        content: v.any(),
        complexity: v.number(),
        xp_reward: v.number(),
    }).index("by_order", ["lesson_order"]),
});
