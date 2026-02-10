import { mutation } from "./_generated/server";

/**
 * Seed initial lessons into skill-specific tables
 * Run this once to populate the database
 */
export const seedSkillLessons = mutation({
    args: {},
    handler: async (ctx) => {
        // Check if lessons already exist
        const existingRW = await ctx.db.query("lessons_reading_writing").collect();
        const existingSpeaking = await ctx.db.query("lessons_speaking").collect();
        const existingGrammar = await ctx.db.query("lessons_grammar").collect();
        const existingVocab = await ctx.db.query("lessons_vocabulary").collect();

        const totalExisting = existingRW.length + existingSpeaking.length + existingGrammar.length + existingVocab.length;

        if (totalExisting > 0) {
            return {
                success: false,
                message: `Database already has ${totalExisting} lessons. Skipping seed.`,
            };
        }

        // Reading & Writing Lessons
        await ctx.db.insert("lessons_reading_writing", {
            lesson_order: 1,
            title: "Kashmiri Alphabet Basics",
            description: "Learn the core vowels and consonants of the Perso-Arabic script",
            complexity: 1,
            xp_reward: 15,
            content: {
                steps: [
                    {
                        type: "teach",
                        content: {
                            title: "The Kashmiri Script",
                            description: "Kashmiri uses a modified Perso-Arabic script. Let's start with some basic letters.",
                            kashmiri_text: "ا ب پ ت",
                            transliteration: "Alif, Be, Pe, Te",
                        },
                    },
                    {
                        type: "quiz",
                        content: {
                            question: "Which letter represents the 'A' sound?",
                            options: ["ب", "ا", "پ", "ت"],
                            correct_index: 1,
                        },
                    },
                ],
            },
        });

        // Speaking Lessons
        await ctx.db.insert("lessons_speaking", {
            lesson_order: 1,
            title: "Greetings & Introductions",
            description: "Learn basic greetings and how to introduce yourself in Kashmiri",
            complexity: 1,
            xp_reward: 10,
            content: {
                steps: [
                    {
                        type: "teach",
                        content: {
                            title: "Common Greetings",
                            description: "In Kashmiri, 'Asalāmu-alaikum' (السلام علیکم) is a respectful greeting. Friends might say 'Kyah chuh' (کیاہ چھ) meaning 'What's up?'",
                            kashmiri_text: "السلام علیکم",
                            transliteration: "Asalāmu-alaikum",
                        },
                    },
                    {
                        type: "quiz",
                        content: {
                            question: "How do you say 'What's up?' in Kashmiri?",
                            options: ["Asalāmu-alaikum", "Kyah chuh", "Shukriya", "Mehrbani"],
                            correct_index: 1,
                        },
                    },
                ],
            },
        });

        // Grammar Lessons
        await ctx.db.insert("lessons_grammar", {
            lesson_order: 1,
            title: "Basic Sentence Structure",
            description: "Understand how Kashmiri sentences are formed",
            complexity: 2,
            xp_reward: 12,
            content: {
                steps: [
                    {
                        type: "teach",
                        content: {
                            title: "Subject-Object-Verb Order",
                            description: "Kashmiri typically follows SOV (Subject-Object-Verb) word order, similar to Hindi and Urdu.",
                            kashmiri_text: "بہ کتاب پڑان چھس",
                            transliteration: "Bi kitaab paraan chhas",
                        },
                    },
                    {
                        type: "quiz",
                        content: {
                            question: "What is the typical word order in Kashmiri?",
                            options: ["SVO (Subject-Verb-Object)", "SOV (Subject-Object-Verb)", "VSO (Verb-Subject-Object)", "OVS (Object-Verb-Subject)"],
                            correct_index: 1,
                        },
                    },
                ],
            },
        });

        // Vocabulary Lessons
        await ctx.db.insert("lessons_vocabulary", {
            lesson_order: 1,
            title: "Numbers 1-10",
            description: "Learn to count from 1 to 10 in Kashmiri",
            complexity: 1,
            xp_reward: 10,
            content: {
                steps: [
                    {
                        type: "teach",
                        content: {
                            title: "Counting in Kashmiri",
                            description: "Let's learn the numbers 1 through 10.",
                            kashmiri_text: "اَکھ، زٕ، ترٛے، ژور، پانٛژ",
                            transliteration: "Akh, Ze, Tray, Tsōr, Paañ",
                        },
                    },
                    {
                        type: "quiz",
                        content: {
                            question: "What is the number 'one' in Kashmiri?",
                            options: ["Ze", "Akh", "Tray", "Paañ"],
                            correct_index: 1,
                        },
                    },
                ],
            },
        });

        return {
            success: true,
            message: "Successfully seeded 4 initial lessons (1 per skill)!",
            breakdown: {
                reading_writing: 1,
                speaking: 1,
                grammar: 1,
                vocabulary: 1,
            },
        };
    },
});
