import { Client } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function fixLessonProgressId() {
    try {
        await client.connect();

        // Alter the table to set default value for id
        await client.query(`
            ALTER TABLE public.lesson_progress
            ALTER COLUMN id SET DEFAULT gen_random_uuid();
        `);

        console.log('Successfully added default UUID generation to lesson_progress.id');

    } catch (e) {
        console.error('Error fixing lesson_progress ID:', e);
    } finally {
        await client.end();
    }
}

fixLessonProgressId();
