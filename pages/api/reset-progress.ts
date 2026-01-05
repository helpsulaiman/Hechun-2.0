
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { prisma } from '../../lib/prisma'; // Using prisma for cleaner deletes if available, or direct supabase

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const supabase = createServerSupabaseClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = session.user.id;

    try {
        // 1. Delete all lesson progress
        const { error: deleteError } = await supabase
            .from('lesson_progress')
            .delete()
            .eq('user_id', userId);

        if (deleteError) throw deleteError;

        // 2. Reset User Profile Stats
        // Reset XP, lessons_completed to 0. Retrieve default skill vector if needed or just reset it.
        // Default skills: { reading: 10, writing: 10, speaking: 10, listening: 10 }

        const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
                lessons_completed: 0,
                total_xp: 0,
                streak_days: 0,
                skill_vector: null // Nullify skills to trigger onboarding
            })
            .eq('user_id', userId);

        if (updateError) throw updateError;

        return res.status(200).json({ success: true });
    } catch (error: any) {
        console.error('Error resetting progress:', error);
        return res.status(500).json({ error: error.message || 'Failed to reset progress' });
    }
}
