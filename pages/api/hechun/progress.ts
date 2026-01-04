import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const supabase = createPagesServerClient({ req, res });
    const {
        data: { session },
    } = await supabase.auth.getSession();

    // Guard: Only for logged in users for DB storage. 
    // Guests handle progress in localStorage.
    if (!session?.user) {
        return res.status(200).json({ message: 'Guest progress tracked client-side' });
    }

    const { lessonId, score } = req.body;

    if (!lessonId) {
        return res.status(400).json({ error: 'Missing lessonId' });
    }

    try {
        // 1. Get User Profile ID
        const userProfile = await prisma.userProfile.findUnique({
            where: { user_id: session.user.id }
        });

        if (!userProfile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // 2. Record Progress (Upsert to avoid duplicates or handle re-takes)
        // Check if already completed to determine skill gain factor
        const existingProgress = await prisma.lessonProgress.findFirst({
            where: {
                user_id: userProfile.id,
                lesson_id: lessonId
            }
        });

        // If retaking, gain is only 10%
        const gainFactor = existingProgress ? 0.1 : 1.0;

        await prisma.lessonProgress.create({
            data: {
                user_id: userProfile.id,
                lesson_id: lessonId,
                score: score || 1.0,
            }
        });

        // 3. Update Skill Vector (Simple Adaptive Logic)
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId }
        });

        if (lesson && lesson.skills_targeted) {
            const targeted = lesson.skills_targeted as Record<string, number>;
            const currentVector = (userProfile.skill_vector as Record<string, number>) || { reading: 0, writing: 0, speaking: 0 };

            // Update Logic: Increase skill based on lesson target * score
            const newVector = { ...currentVector };

            for (const [skill, weight] of Object.entries(targeted)) {
                const current = newVector[skill] || 0;
                // Bonus = Weight (0-1) * BaseGain (10) * Score (0-1) * RetakeFactor
                // e.g. Reading 1.0 * 10 * 1.0 * 1.0 = +10 Points
                // Retake: Reading 1.0 * 10 * 1.0 * 0.1 = +1 Point
                const gain = weight * 10 * (score || 1) * gainFactor;
                newVector[skill] = Math.round(current + gain);
            }

            await prisma.userProfile.update({
                where: { id: userProfile.id },
                data: {
                    skill_vector: newVector
                }
            });
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to save progress' });
    }
}
