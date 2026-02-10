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

// GET Single Lesson by ID
export const getById = query({
  args: { lesson_id: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lessons")
      .filter((q) => q.eq(q.field("lesson_id"), args.lesson_id))
      .first();
  },
});

/**
 * Get next incomplete lesson for a user
 * Used to suggest what lesson to take next
 */
export const getNextLesson = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all completed lesson IDs
    const completedProgress = await ctx.db
      .query("lesson_progress")
      .withIndex("by_user", (q) => q.eq("user_id", args.userId))
      .collect();

    const completedLessonIds = completedProgress.map((p) => p.lesson_id);

    // Get all lessons in order
    const allLessons = await ctx.db
      .query("lessons")
      .withIndex("by_order")
      .collect();

    // Find first incomplete lesson
    const nextLesson = allLessons.find(
      (lesson) => !completedLessonIds.includes(lesson.lesson_id)
    );

    if (!nextLesson) {
      return { completed: true, message: "All lessons completed!" };
    }

    return {
      completed: false,
      lesson: nextLesson,
    };
  },
});

/**
 * Seed mock lessons - Call this once to populate the database with sample lessons
 * Usage: Can be called from Convex dashboard or via a frontend button
 */
export const seedMockLessons = mutation({
  args: {},
  handler: async (ctx) => {
    const mockLessons = [
      {
        lesson_id: 5,
        lesson_order: 5,
        title: "Greetings & Introductions",
        description: "Learn basic greetings and how to introduce yourself in Kashmiri",
        complexity: 1,
        xp_reward: 10,
        skills_targeted: {
          speaking: 0.6,
          vocabulary: 0.4,
          reading_writing: 0,
          grammar: 0,
        },
        content: {
          steps: [
            {
              type: "teach",
              content: {
                title: "Common Greetings",
                text: "In Kashmiri, 'Asalāmu-alaikum' (السلام علیکم) is a respectful greeting. Friends might say 'Kyah chuh' (کیاہ چھ) meaning 'What's up?'",
                examples: [
                  { kashmiri: "Asalāmu-alaikum", english: "Peace be unto you (formal greeting)" },
                  { kashmiri: "Kyah chuh", english: "What's up? (casual)" },
                  { kashmiri: "Tohi kyah naam chuh?", english: "What is your name?" },
                ],
              },
            },
            {
              type: "quiz_multiple_choice",
              content: {
                question: "How do you say 'What is your name?' in Kashmiri?",
                options: [
                  "Kyah chuh",
                  "Tohi kyah naam chuh",
                  "Asalāmu-alaikum",
                  "Bi chus theek",
                ],
                correctIndex: 1,
              },
            },
          ],
        },
      },
      {
        lesson_id: 6,
        lesson_order: 6,
        title: "Kashmiri Alphabet Basics",
        description: "Introduction to the Kashmiri script and basic letter recognition",
        complexity: 2,
        xp_reward: 15,
        skills_targeted: {
          reading_writing: 0.8,
          vocabulary: 0.2,
          speaking: 0,
          grammar: 0,
        },
        content: {
          steps: [
            {
              type: "teach",
              content: {
                title: "The Kashmiri Script",
                text: "Kashmiri uses a modified Perso-Arabic script. Let's start with some basic letters.",
                examples: [
                  { kashmiri: "ا", english: "Alif (A)" },
                  { kashmiri: "ب", english: "Be (B)" },
                  { kashmiri: "پ", english: "Pe (P)" },
                ],
              },
            },
            {
              type: "quiz_multiple_choice",
              content: {
                question: "Which letter represents 'A' sound?",
                options: ["ب", "ا", "پ", "ت"],
                correctIndex: 1,
              },
            },
          ],
        },
      },
      {
        lesson_id: 7,
        lesson_order: 7,
        title: "Basic Conversation",
        description: "Learn how to have a simple conversation in Kashmiri",
        complexity: 3,
        xp_reward: 20,
        skills_targeted: {
          speaking: 0.5,
          vocabulary: 0.3,
          grammar: 0.2,
          reading_writing: 0,
        },
        content: {
          steps: [
            {
              type: "teach",
              content: {
                title: "Asking How Someone Is",
                text: "Learn to ask how someone is doing and respond appropriately.",
                examples: [
                  { kashmiri: "Tohi kyah chiv karan?", english: "What are you doing?" },
                  { kashmiri: "Bi chus theek", english: "I am fine" },
                  { kashmiri: "Tohi chiv varaay?", english: "Are you well?" },
                ],
              },
            },
            {
              type: "quiz_multiple_choice",
              content: {
                question: "What is the correct response to 'Tohi chiv varaay?' (Are you well?)",
                options: [
                  "Kyah chuh",
                  "Bi chus theek",
                  "Tohi kyah naam chuh",
                  "Asalāmu-alaikum",
                ],
                correctIndex: 1,
              },
            },
          ],
        },
      },
    ];

    // Check which lessons already exist
    const existingLessons = await ctx.db.query("lessons").collect();
    const existingIds = new Set(existingLessons.map(l => l.lesson_id));

    const lessonsToAdd = mockLessons.filter(lesson => !existingIds.has(lesson.lesson_id));

    if (lessonsToAdd.length === 0) {
      return {
        success: false,
        message: `All ${mockLessons.length} lessons already exist in the database. No lessons were added.`,
        existing: existingLessons.length,
      };
    }

    // Insert only new lessons
    for (const lesson of lessonsToAdd) {
      await ctx.db.insert("lessons", lesson);
    }

    return {
      success: true,
      message: `Successfully seeded ${lessonsToAdd.length} new lessons! (${existingLessons.length} lessons already existed)`,
      added: lessonsToAdd.length,
      existing: existingLessons.length,
      total: existingLessons.length + lessonsToAdd.length,
    };
  },
});

