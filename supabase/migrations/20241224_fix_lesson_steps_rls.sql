-- Enable RLS on lesson_steps just to be sure
ALTER TABLE lesson_steps ENABLE ROW LEVEL SECURITY;

-- Policy to allow read access to everyone (public) so lessons can be viewed
CREATE POLICY "Enable read access for all users" ON lesson_steps
    FOR SELECT
    USING (true);

-- Policy to allow insert/update/delete for authenticated users
-- This allows logged-in users (like the admin) to edit lessons.
CREATE POLICY "Enable write access for authenticated users" ON lesson_steps
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Double check learning_lessons and learning_levels too, just in case
ALTER TABLE learning_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users on lessons" ON learning_lessons
    FOR SELECT USING (true);
CREATE POLICY "Enable write access for authenticated users on lessons" ON learning_lessons
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE learning_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users on levels" ON learning_levels
    FOR SELECT USING (true);
CREATE POLICY "Enable write access for authenticated users on levels" ON learning_levels
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
