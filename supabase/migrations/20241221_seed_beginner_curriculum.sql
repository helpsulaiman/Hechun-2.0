-- ==========================================
-- SEED SCRIPT: Beginner Curriculum (Level 1)
-- ==========================================

-- 1. Create the Level (if it doesn't exist)
-- We use ON CONFLICT DO NOTHING to avoid errors if run multiple times.
-- Adjust 'min_stars_required' as needed.
INSERT INTO levels (id, name, description, level_order, min_stars_required)
VALUES (1, 'Beginner', 'Start your journey with the basics of Kashmiri.', 1, 0)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description;


-- 2. Insert Lessons
-- We use a temporary table or VALUES list to define our curriculum structure.
-- The ON CONFLICT (id) clause assumes 'id' is a primary key. 
-- IF NOT: We might rely on (level_id, lesson_order) uniqueness if that constraint exists.
-- For safety here, I will use a clearer Upsert strategy based on lesson_order for Level 1.

DO $$
DECLARE
    lvl_id INT := 1;
BEGIN
    -- Clear existing lessons for this level if you want a fresh start (Optional - UNCOMMENT to wipe old data)
    -- DELETE FROM lessons WHERE level_id = lvl_id;

    -- Module 1: Letters & Basic Words (1-5)
    INSERT INTO lessons (level_id, lesson_order, title, description, xp_reward) VALUES
    (lvl_id, 1, 'Alphabet Basics', 'Introduction to Kashmiri script and sounds.', 10),
    (lvl_id, 2, 'Vowels (Wawels)', 'Mastering the unique vowel sounds of Kashmiri.', 10),
    (lvl_id, 3, 'Consonants I', 'First set of basic consonants.', 10),
    (lvl_id, 4, 'Consonants II', 'Advanced consonants and unique sounds.', 10),
    (lvl_id, 5, 'First Words', 'Combining letters to form your first words.', 15)
    ON CONFLICT (level_id, lesson_order) DO UPDATE
    SET title = EXCLUDED.title, description = EXCLUDED.description;

    -- Module 2: Numbers (6-10)
    INSERT INTO lessons (level_id, lesson_order, title, description, xp_reward) VALUES
    (lvl_id, 6, 'Numbers 1-10', 'Counting from one to ten.', 10),
    (lvl_id, 7, 'Numbers 11-20', 'Counting up to twenty.', 10),
    (lvl_id, 8, 'Counting Objects', 'How to count things in Kashmiri.', 15),
    (lvl_id, 9, 'Time Basics', 'Telling time and periods of day.', 15),
    (lvl_id, 10, 'Calendar', 'Days of the week and months.', 15)
    ON CONFLICT (level_id, lesson_order) DO UPDATE
    SET title = EXCLUDED.title, description = EXCLUDED.description;

    -- Module 3: Basic Conversational Words (11-15)
    INSERT INTO lessons (level_id, lesson_order, title, description, xp_reward) VALUES
    (lvl_id, 11, 'Greetings', 'Hello, goodbye, and how are you.', 10),
    (lvl_id, 12, 'Family (Khandan)', 'Names for family members and relatives.', 10),
    (lvl_id, 13, 'Colors (Rang)', 'The vibrant colors of Kashmir.', 10),
    (lvl_id, 14, 'Food & Drink', 'Basic food items and dining terms.', 10),
    (lvl_id, 15, 'Common Objects', 'Everyday items around the house.', 10)
    ON CONFLICT (level_id, lesson_order) DO UPDATE
    SET title = EXCLUDED.title, description = EXCLUDED.description;

    -- Module 4: Simple Sentences (16-20)
    INSERT INTO lessons (level_id, lesson_order, title, description, xp_reward) VALUES
    (lvl_id, 16, 'I am...', 'Introducing yourself and basic states.', 20),
    (lvl_id, 17, 'This is...', 'Identifying objects and people.', 20),
    (lvl_id, 18, 'Questions', 'Who, what, where, and when.', 20),
    (lvl_id, 19, 'Actions (Verbs)', 'Basic verbs and simple actions.', 20),
    (lvl_id, 20, 'Day to Day', 'Simple daily routine sentences.', 25)
    ON CONFLICT (level_id, lesson_order) DO UPDATE
    SET title = EXCLUDED.title, description = EXCLUDED.description;

END $$;
