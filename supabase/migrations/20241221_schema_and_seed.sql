-- ==========================================
-- SCHEMA CREATION & SEED SCRIPT
-- ==========================================

-- 1. Create Tables (if they don't exist)

CREATE TABLE IF NOT EXISTS levels (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    level_order INTEGER NOT NULL DEFAULT 1,
    min_stars_required INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    level_id INTEGERREFERENCES levels(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    lesson_order INTEGER NOT NULL DEFAULT 1,
    xp_reward INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Unique constraint to allow easy upserts based on order within a level
    UNIQUE (level_id, lesson_order)
);

-- Optional: Create user_progress table if needed for the types we saw
CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    stars INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, lesson_id)
);


-- 2. SEED DATA: Beginner Curriculum
-- =================================

-- Insert Level 1
INSERT INTO levels (id, name, description, level_order, min_stars_required)
VALUES (1, 'Beginner', 'Start your journey with the basics of Kashmiri.', 1, 0)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Insert Lessons 1-20
INSERT INTO lessons (level_id, lesson_order, title, description, xp_reward) VALUES
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
(1, 20, 'Day to Day', 'Simple daily routine sentences.', 25)
ON CONFLICT (level_id, lesson_order) DO UPDATE
SET title = EXCLUDED.title, description = EXCLUDED.description;
