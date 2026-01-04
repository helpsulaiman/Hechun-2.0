-- ==========================================
-- FINAL SCHEMA FIX & SEED
-- ==========================================

-- 1. DROP BAD TABLES (and the table that references them)
DROP TABLE IF EXISTS user_progress;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS levels CASCADE;

-- 2. FIX EXISTING TABLE (Add missing column)
ALTER TABLE learning_lessons 
ADD COLUMN IF NOT EXISTS xp_reward INTEGER NOT NULL DEFAULT 10;

-- 3. RECREATE user_progress (Correctly linked)
CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES learning_lessons(id) ON DELETE CASCADE,
    stars INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, lesson_id)
);

-- 4. SEED DATA

-- Ensure Level 1 Exists
INSERT INTO learning_levels (id, name, description, level_order, min_stars_required)
VALUES (1, 'Beginner', 'Start your journey with the basics of Kashmiri.', 1, 0)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Clear old lessons for Level 1
DELETE FROM learning_lessons WHERE level_id = 1;

-- Insert Lessons (Now safe because xp_reward exists)
INSERT INTO learning_lessons (level_id, lesson_order, title, description, xp_reward) VALUES
(1, 1, 'Alphabet Basics', 'Introduction to Kashmiri script and sounds.', 10),
(1, 2, 'Vowels (Wawels)', 'Mastering the unique vowel sounds of Kashmiri.', 10),
(1, 3, 'Consonants I', 'First set of basic consonants.', 10),
(1, 4, 'Consonants II', 'Advanced consonants and unique sounds.', 10),
(1, 5, 'First Words', 'Combining letters to form your first words.', 15),
(1, 6, 'Numbers 1-10', 'Counting from one to ten.', 10),
(1, 7, 'Numbers 11-20', 'Counting up to twenty.', 10),
(1, 8, 'Counting Objects', 'How to count things in Kashmiri.', 15),
(1, 9, 'Time Basics', 'Telling time and periods of day.', 15),
(1, 10, 'Calendar', 'Days of the week and months.', 15),
(1, 11, 'Greetings', 'Hello, goodbye, and how are you.', 10),
(1, 12, 'Family (Khandan)', 'Names for family members and relatives.', 10),
(1, 13, 'Colors (Rang)', 'The vibrant colors of Kashmir.', 10),
(1, 14, 'Food & Drink', 'Basic food items and dining terms.', 10),
(1, 15, 'Common Objects', 'Everyday items around the house.', 10),
(1, 16, 'I am...', 'Introducing yourself and basic states.', 20),
(1, 17, 'This is...', 'Identifying objects and people.', 20),
(1, 18, 'Questions', 'Who, what, where, and when.', 20),
(1, 19, 'Actions (Verbs)', 'Basic verbs and simple actions.', 20),
(1, 20, 'Day to Day', 'Simple daily routine sentences.', 25);
