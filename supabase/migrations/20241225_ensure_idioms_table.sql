-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the idioms table if it doesn't exist
CREATE TABLE IF NOT EXISTS idioms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    idiom_kashmiri TEXT NOT NULL,
    transliteration TEXT,
    translation TEXT,
    meaning TEXT NOT NULL,
    tags TEXT[],
    audio_url TEXT,
    status TEXT DEFAULT 'approved',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE idioms ENABLE ROW LEVEL SECURITY;

-- 1. DROP existing policies to ensure clean slate (avoiding "policy exists" errors)
DROP POLICY IF EXISTS "Public idioms are viewable by everyone" ON idioms;
DROP POLICY IF EXISTS "Authenticated users can insert idioms" ON idioms;
DROP POLICY IF EXISTS "Authenticated users can update idioms" ON idioms;
DROP POLICY IF EXISTS "Authenticated users can delete idioms" ON idioms;

-- 2. CREATE Policies

-- Allow everyone (public/anon) to VIEW idioms
CREATE POLICY "Public idioms are viewable by everyone"
ON idioms FOR SELECT
USING (true);

-- Allow authenticated users to INSERT
CREATE POLICY "Authenticated users can insert idioms"
ON idioms FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to UPDATE
CREATE POLICY "Authenticated users can update idioms"
ON idioms FOR UPDATE
USING (auth.role() = 'authenticated');

-- Allow authenticated users to DELETE
CREATE POLICY "Authenticated users can delete idioms"
ON idioms FOR DELETE
USING (auth.role() = 'authenticated');

-- Add trigger for updated_at if it doesn't exist (Optional/Good practice)
-- (Skipping specific trigger creation to avoid complexity if function missing, standard usage implies manual or default handling)
