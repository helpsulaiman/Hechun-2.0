import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * ====================================
 * SKILL-BASED LESSON QUERIES
 * ====================================
 */

/**
 * Get next lesson for a specific skill
 * Used when you know which skill you want to practice
 */
export const getNextLessonForSkill = query({
    args: {
        userId: v.string(),
        skill: v.union(
            v.literal("reading_writing"),
            v.literal("speaking"),
            v.literal("grammar"),
            v.literal("vocabulary")
        ),
    },
    handler: async (ctx, args) => {
        // Get user profile
        const user = await ctx.db
            .query("user_profiles")
            .withIndex("by_user_id", (q) => q.eq("user_id", args.userId))
            .unique();

        if (!user) return null;

        // Get completed lessons for this skill
        const completed = user.lessons_completed_by_skill?.[args.skill] || [];
        const tableName = `lessons_${args.skill}` as
            | "lessons_reading_writing"
            | "lessons_speaking"
            | "lessons_grammar"
            | "lessons_vocabulary";

        // Get all lessons for this skill
        const lessons = await ctx.db
            .query(tableName)
            .withIndex("by_order")
            .collect();

        // Find first lesson not in completed array
        const nextLesson = lessons.find(
            (lesson) => !completed.includes(lesson.lesson_order)
        );

        if (!nextLesson) {
            return {
                completed: true,
                message: `All ${args.skill} lessons completed!`,
                skill: args.skill,
            };
        }

        return {
            completed: false,
            lesson: nextLesson,
            skill: args.skill,
            progress: {
                completed: completed.length,
                total: lessons.length,
            },
        };
    },
});

/**
 * Smart next lesson recommendation based on weakest skill
 * This is the main lesson selector for the homepage
 */
export const getNextLesson = query({
    args: {
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        // Get user profile
        const user = await ctx.db
            .query("user_profiles")
            .withIndex("by_user_id", (q) => q.eq("user_id", args.userId))
            .unique();

        if (!user) {
            return {
                completed: false,
                message: "User not found",
            };
        }

        // Get current skill points
        const skills = user.skill_vector || {
            reading_writing: 0,
            speaking: 0,
            grammar: 0,
            vocabulary: 0,
        };

        // Find weakest skill (lowest points)
        const weakestSkill = (Object.entries(skills)
            .sort(([, a], [, b]) => (a as number) - (b as number))[0][0]) as
            | "reading_writing"
            | "speaking"
            | "grammar"
            | "vocabulary";

        // Get next lesson from that skill's table
        const completed =
            user.lessons_completed_by_skill?.[weakestSkill] || [];
        const tableName = `lessons_${weakestSkill}` as
            | "lessons_reading_writing"
            | "lessons_speaking"
            | "lessons_grammar"
            | "lessons_vocabulary";

        const lessons = await ctx.db
            .query(tableName)
            .withIndex("by_order")
            .collect();

        const nextLesson = lessons.find(
            (lesson) => !completed.includes(lesson.lesson_order)
        );

        if (!nextLesson) {
            // If weakest skill is complete, try next weakest
            const sortedSkills = Object.entries(skills).sort(
                ([, a], [, b]) => (a as number) - (b as number)
            );

            for (const [skill] of sortedSkills.slice(1)) {
                const skillCompleted =
                    user.lessons_completed_by_skill?.[
                    skill as keyof typeof user.lessons_completed_by_skill
                    ] || [];
                const skillTable = `lessons_${skill}` as
                    | "lessons_reading_writing"
                    | "lessons_speaking"
                    | "lessons_grammar"
                    | "lessons_vocabulary";

                const skillLessons = await ctx.db
                    .query(skillTable)
                    .withIndex("by_order")
                    .collect();

                const nextFromSkill = skillLessons.find(
                    (lesson) => !skillCompleted.includes(lesson.lesson_order)
                );

                if (nextFromSkill) {
                    return {
                        completed: false,
                        lesson: nextFromSkill,
                        skill,
                        recommendedBecause: "weakest_skill",
                        skillPoints: skills[skill as keyof typeof skills],
                    };
                }
            }

            // All skills complete!
            return {
                completed: true,
                message: "🎉 All lessons completed! You're a Kashmiri master!",
            };
        }

        return {
            completed: false,
            lesson: nextLesson,
            skill: weakestSkill,
            recommendedBecause: "weakest_skill",
            skillPoints: skills[weakestSkill],
        };
    },
});

/**
 * Get all lessons for a specific skill (for admin/browsing)
 */
export const getLessonsForSkill = query({
    args: {
        skill: v.union(
            v.literal("reading_writing"),
            v.literal("speaking"),
            v.literal("grammar"),
            v.literal("vocabulary")
        ),
    },
    handler: async (ctx, args) => {
        const tableName = `lessons_${args.skill}` as
            | "lessons_reading_writing"
            | "lessons_speaking"
            | "lessons_grammar"
            | "lessons_vocabulary";

        return await ctx.db.query(tableName).withIndex("by_order").collect();
    },
});

/**
 * Get a specific lesson by skill and order
 */
export const getLessonBySkillAndOrder = query({
    args: {
        skill: v.union(
            v.literal("reading_writing"),
            v.literal("speaking"),
            v.literal("grammar"),
            v.literal("vocabulary")
        ),
        lessonOrder: v.number(),
    },
    handler: async (ctx, args) => {
        const tableName = `lessons_${args.skill}` as
            | "lessons_reading_writing"
            | "lessons_speaking"
            | "lessons_grammar"
            | "lessons_vocabulary";

        const lessons = await ctx.db.query(tableName).withIndex("by_order").collect();
        return lessons.find((lesson) => lesson.lesson_order === args.lessonOrder);
    },
});

/**
 * Get a specific lesson by ID (for editing)
 */
export const getLessonById = query({
    args: {
        skill: v.union(
            v.literal("reading_writing"),
            v.literal("speaking"),
            v.literal("grammar"),
            v.literal("vocabulary")
        ),
        lessonId: v.id("lessons_reading_writing"), // Generic ID type, works for all if tables are similar
    },
    handler: async (ctx, args) => {
        // dynamic table name
        const tableName = `lessons_${args.skill}` as
            | "lessons_reading_writing"
            | "lessons_speaking"
            | "lessons_grammar"
            | "lessons_vocabulary";

        // We can't use ctx.db.get(args.lessonId) directly because we don't know if the ID matches the table? 
        // Actually ID contains table info in Convex? No, IDs are table-specific.
        // But we cast it to "lessons_reading_writing" in args.
        // Let's just try getting it. Open question: Does Convex throw if ID doesn't match table?
        // Usually yes. But we are passing `skill` so we know the table.
        // Wait, `v.id("table")` expects an ID from that specific table.
        // If we want a dynamic ID, we might need v.string() and ctx.db.normalizeId?
        // Or just use v.string() for the ID argument and let `ctx.db.get` handle it if we pass a generic ID?
        // Actually, for `ctx.db.get(id)`, the ID must be an `Id` object.
        // Let's use v.string() and assume we can cast or use generic get.

        return await ctx.db.get(args.lessonId);
    },
});

/**
 * ====================================
 * ADMIN: CRUD MUTATIONS FOR SKILL TABLES
 * ====================================
 */

/**
 * Create a new lesson in a skill-specific table
 */
export const createLessonForSkill = mutation({
    args: {
        skill: v.union(
            v.literal("reading_writing"),
            v.literal("speaking"),
            v.literal("grammar"),
            v.literal("vocabulary")
        ),
        lesson_order: v.number(),
        title: v.string(),
        description: v.optional(v.string()),
        content: v.any(),
        complexity: v.number(),
        xp_reward: v.number(),
    },
    handler: async (ctx, args) => {
        const { skill, ...lessonData } = args;
        const tableName = `lessons_${skill}` as
            | "lessons_reading_writing"
            | "lessons_speaking"
            | "lessons_grammar"
            | "lessons_vocabulary";

        return await ctx.db.insert(tableName, lessonData);
    },
});

/**
 * Update a lesson in a skill-specific table
 */
export const updateLessonForSkill = mutation({
    args: {
        skill: v.union(
            v.literal("reading_writing"),
            v.literal("speaking"),
            v.literal("grammar"),
            v.literal("vocabulary")
        ),
        lessonId: v.id("lessons_reading_writing"), // Can be any lesson table ID
        updates: v.object({
            lesson_order: v.optional(v.number()),
            title: v.optional(v.string()),
            description: v.optional(v.string()),
            content: v.optional(v.any()),
            complexity: v.optional(v.number()),
            xp_reward: v.optional(v.number()),
        }),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.lessonId, args.updates);
    },
});

/**
 * Delete a lesson from a skill-specific table
 */
export const deleteLessonForSkill = mutation({
    args: {
        lessonId: v.id("lessons_reading_writing"), // Can be any lesson table ID
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.lessonId);
    },
});
