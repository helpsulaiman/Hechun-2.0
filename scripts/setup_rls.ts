import { Client } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function setupRLS() {
    try {
        await client.connect();
        console.log('Connected to database.');

        const queries = [
            // 1. Enable RLS (best practice, though we might just open it up first)
            `ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;`,
            `ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;`,
            `ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;`,

            // 2. Lessons: Public Read
            `DROP POLICY IF EXISTS "Public read access" ON public.lessons;`,
            `CREATE POLICY "Public read access" ON public.lessons FOR SELECT USING (true);`,

            // 3. Lesson Progress: Users can see/edit OWN data
            `DROP POLICY IF EXISTS "Users can view own progress" ON public.lesson_progress;`,
            `CREATE POLICY "Users can view own progress" ON public.lesson_progress FOR SELECT USING (auth.uid()::text = user_id);`,

            `DROP POLICY IF EXISTS "Users can insert own progress" ON public.lesson_progress;`,
            `CREATE POLICY "Users can insert own progress" ON public.lesson_progress FOR INSERT WITH CHECK (auth.uid()::text = user_id);`,

            `DROP POLICY IF EXISTS "Users can update own progress" ON public.lesson_progress;`,
            `CREATE POLICY "Users can update own progress" ON public.lesson_progress FOR UPDATE USING (auth.uid()::text = user_id);`,

            // 4. User Profiles: Public Read (Leaderboard), Users edit own
            `DROP POLICY IF EXISTS "Public read profiles" ON public.user_profiles;`,
            `CREATE POLICY "Public read profiles" ON public.user_profiles FOR SELECT USING (true);`, // Open for leaderboard

            `DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;`,
            `CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid()::text = user_id);`,

            // Allow Service Role full access (implicit, but good to be aware)
        ];

        for (const query of queries) {
            await client.query(query);
            console.log(`Executed: ${query.substring(0, 50)}...`);
        }

        console.log('RLS Policies applied successfully.');

    } catch (error) {
        console.error('Error enabling RLS:', error);
    } finally {
        await client.end();
    }
}

setupRLS();
