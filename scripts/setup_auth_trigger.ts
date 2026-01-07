import { Client } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Use DIRECT_URL for direct connection (bypassing pooler if needed) 
// or DATABASE_URL if DIRECT is not set, but typical Supabase setup uses DIRECT_URL for migrations.
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
    console.error('Error: DATABASE_URL or DIRECT_URL is not set in .env.local');
    process.exit(1);
}

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false } // Required for Supabase
});

async function setupAuthTrigger() {
    try {
        await client.connect();
        console.log('Connected to database.');

        // 1. Create the Function
        const createFunctionQuery = `
            CREATE OR REPLACE FUNCTION public.handle_new_user()
            RETURNS trigger
            LANGUAGE plpgsql
            SECURITY DEFINER SET search_path = public
            AS $$
            BEGIN
              INSERT INTO public.user_profiles (id, user_id, email, username, avatar_url, created_at, updated_at)
              VALUES (
                  gen_random_uuid(),
                  new.id, 
                  new.email, 
                  COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
                  COALESCE(
                      new.raw_user_meta_data->>'avatar_url',
                      new.raw_user_meta_data->>'picture',
                      new.raw_user_meta_data->>'avatar'
                  ),
                  now(),
                  now()
              )
              ON CONFLICT (user_id) DO NOTHING;
              RETURN new;
            END;
            $$;
        `;

        await client.query(createFunctionQuery);
        console.log('Function handle_new_user created/updated.');

        // 2. Create the Trigger
        const createTriggerQuery = `
            DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
            CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
        `;

        await client.query(createTriggerQuery);
        console.log('Trigger on_auth_user_created created.');

        // 3. Backfill existing users (optional but good practice)
        // This attempts to insert profiles for users who exist in auth.users but not in user_profiles
        // Be careful with large datasets, but for this app it should be fine.
        /* 
           NOTE: We cannot easily select from auth.users via simple client connection unless we are postgres role.
           The connection string usually provides postgres/service_role privileges.
        */

        console.log('Setup complete.');

    } catch (error) {
        console.error('Error setting up trigger:', error);
    } finally {
        await client.end();
    }
}

setupAuthTrigger();
