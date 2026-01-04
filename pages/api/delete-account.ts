import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 1. Verify the user is authenticated
        const supabaseUser = createServerSupabaseClient({ req, res });
        const {
            data: { session },
        } = await supabaseUser.auth.getSession();

        if (!session?.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userId = session.user.id;

        // 2. Initialize Admin Client (Service Role)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            console.error('Missing env variables for admin deletion');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // 3. Delete user data using Admin client
        // Note: Supabase cascading deletes should handle related data if configured in DB.
        // If not, we might need to manually delete from user_stats, learning_progress, etc.
        // Assuming cascade is set up or RLS allows user to delete their own data rows 
        // (though deleteUser deletes the auth user which is the critical part).

        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (deleteError) {
            throw deleteError;
        }

        return res.status(200).json({ success: true });

    } catch (error: any) {
        console.error('Delete account error:', error);
        return res.status(500).json({ error: error.message || 'Failed to delete account' });
    }
}
