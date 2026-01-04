import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { prisma } from '../../../lib/prisma';
import { UserProfile, SkillProfile } from '../../../types/hechun';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const supabase = createPagesServerClient({ req, res });
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const userId = session?.user?.id;

    if (req.method === 'GET') {
        if (!userId) {
            return res.status(200).json({ hasProfile: false, isGuest: true });
        }

        try {
            const profile = await prisma.userProfile.findUnique({
                where: { user_id: userId },
            });

            return res.status(200).json({
                hasProfile: !!profile,
                profile,
                isGuest: false
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    if (req.method === 'POST') {
        // Create/Update Profile
        const { skills } = req.body as { skills: SkillProfile };

        // Convert skill levels to numeric scores
        const skillMap = {
            'none': 0,
            'beginner': 25,
            'intermediate': 50,
            'fluent': 85
        };

        const skillVector = {
            reading: skillMap[skills.reading],
            writing: skillMap[skills.writing],
            speaking: skillMap[skills.speaking],
        };

        try {
            if (userId) {
                // Authenticated User
                const profile = await prisma.userProfile.upsert({
                    where: { user_id: userId },
                    update: { skill_vector: skillVector },
                    create: {
                        user_id: userId,
                        skill_vector: skillVector,
                    },
                });
                return res.status(200).json({ success: true, profile });
            } else {
                // Guest User - We can't save to DB without a user ID.
                // For guests, we return the vector so the frontend can store it in localStorage
                return res.status(200).json({ success: true, isGuest: true, skillVector });
            }
        } catch (error) {
            console.error('Error creating profile:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
