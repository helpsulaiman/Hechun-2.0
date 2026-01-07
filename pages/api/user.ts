import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { prisma } from '../../lib/prisma';
import { UserProfile, SkillProfile } from '../../types/hechun';

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
                hasProfile: !!(profile && profile.skill_vector),
                profile,
                isGuest: false
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    if (req.method === 'POST') {
        const { skills, action, points } = req.body; // points is the earned vector from diagnostic

        if (action === 'complete_diagnostic') {
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            try {
                // Fetch existing profile to increment
                const currentProfile = await prisma.userProfile.findUnique({
                    where: { user_id: userId },
                });

                const currentVector: any = currentProfile?.skill_vector || {
                    reading: 0,
                    writing: 0,
                    speaking: 0,
                    grammar: 0,
                    vocabulary: 0
                };

                // Add earned points
                const newVector = {
                    reading: (currentVector.reading || 0) + (points.reading || 0),
                    writing: (currentVector.writing || 0) + (points.writing || 0),
                    speaking: (currentVector.speaking || 0) + (points.speaking || 0),
                    grammar: (currentVector.grammar || 0) + (points.grammar || 0),
                    vocabulary: (currentVector.vocabulary || 0) + (points.vocabulary || 0),
                };

                const updatedProfile = await prisma.userProfile.upsert({
                    where: { user_id: userId },
                    update: { skill_vector: newVector },
                    create: {
                        user_id: userId,
                        skill_vector: newVector,
                    },
                });

                return res.status(200).json({ success: true, profile: updatedProfile });

            } catch (error) {
                console.error('Error updating diagnostic score:', error);
                return res.status(500).json({ error: 'Failed to save diagnostic score' });
            }
        }

        // Default: Create/Reset Profile (Start Page)
        // Convert skill levels to numeric scores (Reset to 0 requested by user)
        const skillVector = {
            reading: 0,
            writing: 0,
            speaking: 0,
            grammar: 0,
            vocabulary: 0
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
                // Guest User
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
