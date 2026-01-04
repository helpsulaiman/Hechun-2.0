import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username } = req.body;

    if (!username || username.length < 3) {
        return res.status(400).json({ valid: false, message: 'Username too short' });
    }

    try {
        const supabase = createServerSupabaseClient({ req, res });

        // Get current user to exclude them from the check
        const {
            data: { session },
        } = await supabase.auth.getSession();

        let query = supabase
            .from('user_stats')
            .select('user_id')
            .eq('username', username);

        // If logged in, exclude current user
        if (session?.user?.id) {
            query = query.neq('user_id', session.user.id);
        }

        const { data, error } = await query;

        if (error) throw error;

        if (data && data.length > 0) {
            return res.status(200).json({ valid: false, message: 'Username taken' });
        }

        return res.status(200).json({ valid: true, message: 'Username available' });

    } catch (error: any) {
        console.error('Check username error:', error);
        return res.status(500).json({ error: error.message });
    }
}
