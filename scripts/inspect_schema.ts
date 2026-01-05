import { Client } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function inspectTable() {
    try {
        await client.connect();
        const res = await client.query(`
            SELECT column_name, column_default, is_nullable, data_type
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'lesson_progress';
        `);
        console.table(res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

inspectTable();
