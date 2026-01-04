// pages/api/users.ts
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const supabase = createServerSupabaseClient({ req, res });

    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check admin status
    const { data: currentUser } = await supabase
        .from('user_stats')
        .select('is_admin')
        .eq('user_id', session.user.id)
        .single();

    if (!currentUser?.is_admin) {
        return res.status(403).json({ error: 'Admin access required' });
    }

    if (req.method === 'GET') {
        // Fetch users with optional search
        const { search } = req.query;

        let query = supabase
            .from('user_stats')
            .select('user_id, username, total_stars, lessons_completed, is_admin, last_activity_date, updated_at')
            .order('updated_at', { ascending: false });

        if (search && typeof search === 'string' && search.trim()) {
            query = query.ilike('username', `%${search.trim()}%`);
        }

        const { data, error } = await query.limit(50);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data);
    }

    if (req.method === 'PATCH') {
        // Update user (toggle admin status)
        const { user_id, is_admin } = req.body;

        if (!user_id || typeof is_admin !== 'boolean') {
            return res.status(400).json({ error: 'user_id and is_admin are required' });
        }

        // Prevent self-demotion
        if (user_id === session.user.id && !is_admin) {
            return res.status(400).json({ error: 'Cannot remove your own admin status' });
        }

        const { error } = await supabase
            .from('user_stats')
            .update({ is_admin })
            .eq('user_id', user_id);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
