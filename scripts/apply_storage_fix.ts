
import { Client } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function applyFix() {
    try {
        await client.connect();
        console.log('Connected to database.');

        const sql = fs.readFileSync(path.join(process.cwd(), 'scripts/fix_storage_rls.sql'), 'utf-8');
        console.log('Applying SQL fix...');

        // Split by semicolon just in case, or run as one block?
        // simple pg query can run multiple statements if they are standard SQL.
        // But let's run it as one block first.

        await client.query(sql);

        console.log('Storage RLS policies updated successfully.');

    } catch (error) {
        console.error('Error applying fix:', error);
    } finally {
        await client.end();
    }
}

applyFix();
