import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    console.log('Fixing permissions for Supabase roles using pg...');

    const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

    if (!connectionString) {
        console.error('No connection string found (DATABASE_URL or DIRECT_URL)');
        process.exit(1);
    }

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        const queries = [
            `GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;`,
            `GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;`,
            `GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;`,
            `GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;`,
            `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;`
        ];

        for (const query of queries) {
            await client.query(query);
            console.log(`Executed: ${query.substring(0, 50)}...`);
        }

        console.log('✅ Permissions fixed successfully.');
    } catch (error) {
        console.error('❌ Error fixing permissions:', error);
    } finally {
        await client.end();
    }
}

main();
