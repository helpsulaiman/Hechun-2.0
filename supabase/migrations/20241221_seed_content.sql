-- ==========================================
-- SEED CONTENT: LESSON STEPS
-- ==========================================

-- 1. Create lesson_steps table if it doesn't exist
CREATE TABLE IF NOT EXISTS lesson_steps (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER REFERENCES learning_lessons(id) ON DELETE CASCADE,
    step_type TEXT NOT NULL, -- 'teach', 'quiz_easy', 'quiz_hard', 'speak'
    step_order INTEGER NOT NULL DEFAULT 1,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Seed Content for Lesson 1: Alphabet Basics
-- We'll add a mix of teaching and simple quizzes.

DELETE FROM lesson_steps WHERE lesson_id = (SELECT id FROM learning_lessons WHERE level_id = 1 AND lesson_order = 1);

INSERT INTO lesson_steps (lesson_id, step_type, step_order, content)
VALUES
    -- Step 1: Teach 'A'
    (
        (SELECT id FROM learning_lessons WHERE level_id = 1 AND lesson_order = 1),
        'teach',
        1,
        '{
            "title": "The Letter Alif (ا)",
            "description": "The first letter of the Kashmiri alphabet is Alif.",
            "kashmiri_text": "ا",
            "transliteration": "Alif",
            "audio_url": null,
            "image_url": null
        }'::jsonb
    ),
    -- Step 2: Teach 'B'
    (
        (SELECT id FROM learning_lessons WHERE level_id = 1 AND lesson_order = 1),
        'teach',
        2,
        '{
            "title": "The Letter Be (ب)",
            "description": "This is the letter Be. It sounds like the ''b'' in ''boy''.",
            "kashmiri_text": "ب",
            "transliteration": "Be",
            "audio_url": null
        }'::jsonb
    ),
    -- Step 3: Quiz (Multiple Choice)
    (
        (SELECT id FROM learning_lessons WHERE level_id = 1 AND lesson_order = 1),
        'quiz_easy',
        3,
        '{
            "question": "Which letter is Alif?",
            "options": ["ب", "ا", "ت", "ج"],
            "correct_answer": "ا",
            "hint": "It is a vertical line."
        }'::jsonb
    ),
     -- Step 4: Quiz (Matching) - Simplified for now, just another MC
    (
        (SELECT id FROM learning_lessons WHERE level_id = 1 AND lesson_order = 1),
        'quiz_easy',
        4,
        '{
            "question": "What is the sound of ''ب''?",
            "options": ["Alif", "Be", "Te", "Se"],
            "correct_answer": "Be",
            "hint": "B for..."
        }'::jsonb
    );

-- 3. Seed Content for Lesson 2: Vowels
DELETE FROM lesson_steps WHERE lesson_id = (SELECT id FROM learning_lessons WHERE level_id = 1 AND lesson_order = 2);

INSERT INTO lesson_steps (lesson_id, step_type, step_order, content)
VALUES
    (
        (SELECT id FROM learning_lessons WHERE level_id = 1 AND lesson_order = 2),
        'teach',
        1,
        '{
            "title": "Vowel: Zabar (َ)",
            "description": "The Zabar is a small dash above a letter. It makes a short ''a'' sound.",
            "kashmiri_text": "َ",
            "transliteration": "a",
            "examples": ["بَ (Ba)"]
        }'::jsonb
    ),
    (
        (SELECT id FROM learning_lessons WHERE level_id = 1 AND lesson_order = 2),
        'quiz_easy',
        2,
        '{
            "question": "What sound does Zabar make?",
            "options": ["Short ''a''", "Long ''aa''", "Short ''i''", "Long ''ee''"],
            "correct_answer": "Short ''a''"
        }'::jsonb
    );

-- 4. Seed Content for Lesson 6: Numbers 1-10
DELETE FROM lesson_steps WHERE lesson_id = (SELECT id FROM learning_lessons WHERE level_id = 1 AND lesson_order = 6);

INSERT INTO lesson_steps (lesson_id, step_type, step_order, content)
VALUES
    (
        (SELECT id FROM learning_lessons WHERE level_id = 1 AND lesson_order = 6),
        'teach',
        1,
        '{
            "title": "Number One (Akh)",
            "description": "One in Kashmiri is ''Akh''.",
            "kashmiri_text": "اَکھ",
            "transliteration": "Akh",
            "audio_url": null
        }'::jsonb
    ),
    (
        (SELECT id FROM learning_lessons WHERE level_id = 1 AND lesson_order = 6),
        'quiz_easy',
        2,
        '{
            "question": "How do you say ''One'' in Kashmiri?",
            "options": ["Ziy", "Tre", "Akh", "Soor"],
            "correct_answer": "Akh"
        }'::jsonb
    );
