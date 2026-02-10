import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Migration script to split existing lessons into skill-specific tables
 * Run this once to migrate lessons from the main 'lessons' table
 * to skill-specific tables based on their primary skill focus.
 */

export const splitLessonTables = internalMutation({
    handler: async (ctx) => {
        console.log("Starting lesson migration to skill-specific tables...");

        // Get all lessons from the main lessons table
        const allLessons = await ctx.db.query("lessons").collect();
        console.log(`Found ${allLessons.length} lessons to migrate`);

        let migrated = {
            reading_writing: 0,
            speaking: 0,
            grammar: 0,
            vocabulary: 0,
        };

        for (const lesson of allLessons) {
            // Determine primary skill based on skills_targeted
            const skill = determinePrimarySkill(lesson.skills_targeted || {});
            const tableName = `lessons_${skill}` as
                | "lessons_reading_writing"
                | "lessons_speaking"
                | "lessons_grammar"
                | "lessons_vocabulary";

            // Insert into appropriate skill table
            await ctx.db.insert(tableName, {
                lesson_order: lesson.lesson_order,
                title: lesson.title || `Lesson ${lesson.lesson_order}`,
                description: lesson.description,
                content: lesson.content,
                complexity: lesson.complexity,
                xp_reward: lesson.xp_reward,
            });

            migrated[skill]++;
            console.log(`Migrated "${lesson.title || `Lesson ${lesson.lesson_order}`}" → ${tableName}`);
        }

        console.log("Migration complete!");
        console.log("Summary:", migrated);

        return {
            success: true,
            total: allLessons.length,
            migrated,
            message: "Lessons successfully migrated to skill-specific tables"
        };
    },
});

/**
 * Helper function to determine which skill table a lesson belongs to
 * Based on the highest value in the skills_targeted object
 */
function determinePrimarySkill(skillsTargeted: any): string {
    if (!skillsTargeted || typeof skillsTargeted !== 'object') {
        // Default to reading_writing if no skills specified
        return "reading_writing";
    }

    const skills = {
        reading_writing: skillsTargeted.reading_writing || 0,
        speaking: skillsTargeted.speaking || 0,
        grammar: skillsTargeted.grammar || 0,
        vocabulary: skillsTargeted.vocabulary || 0,
    };

    // Find skill with highest target value
    const primarySkill = Object.entries(skills)
        .sort(([, a], [, b]) => b - a)[0][0];

    return primarySkill;
}

/**
 * Optional: Verify migration was successful
 */
export const verifyMigration = internalMutation({
    handler: async (ctx) => {
        const original = await ctx.db.query("lessons").collect();

        const rw = await ctx.db.query("lessons_reading_writing").collect();
        const speaking = await ctx.db.query("lessons_speaking").collect();
        const grammar = await ctx.db.query("lessons_grammar").collect();
        const vocab = await ctx.db.query("lessons_vocabulary").collect();

        const total = rw.length + speaking.length + grammar.length + vocab.length;

        return {
            original_count: original.length,
            migrated_count: total,
            breakdown: {
                reading_writing: rw.length,
                speaking: speaking.length,
                grammar: grammar.length,
                vocabulary: vocab.length,
            },
            success: original.length === total,
        };
    },
});
