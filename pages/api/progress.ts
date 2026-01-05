import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { prisma } from '../../lib/prisma';
import { UserProfile } from '../../types/hechun';
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
        // Calculate Skill Gain
        const completionCount = await prisma.lessonProgress.count({
            where: {
                user_id: userProfile.id,
                lesson_id: lessonId
            }
        });

        let gainFactor = 0;
        if (completionCount === 0) gainFactor = 1.0;
        else if (completionCount === 1) gainFactor = 0.15;
        else if (completionCount === 2) gainFactor = 0.05;
        else gainFactor = 0.0;

        // Calculate Streak
        const now = new Date();
        const lastActive = userProfile.last_active_date ? new Date(userProfile.last_active_date) : null;
        let newStreak = userProfile.streak_days;

        if (lastActive) {
            const isToday = now.toDateString() === lastActive.toDateString();
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const isYesterday = yesterday.toDateString() === lastActive.toDateString();

            if (!isToday) {
                if (isYesterday) {
                    newStreak += 1;
                } else {
                    newStreak = 1; // Reset if missed a day
                }
            }
        } else {
            newStreak = 1; // First lesson ever
        }

        // Apply updates
        // The currentVector and lesson fetch are moved here to be part of the transaction or single update.
        // This also ensures `userProfile.skill_vector` is accessed after `userProfile` is fetched.
        const currentVector = (userProfile.skill_vector as Record<string, number>) || { reading: 0, writing: 0, speaking: 0 };
        const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });


        // Calculate Score (Simple 0.0 - 1.0)
        // Client sends score float? Or we derived it?
        // Let's assume input score is 0.0-1.0
        const finalScore = score || 1.0;

        await prisma.lessonProgress.upsert({
            where: {
                user_id_lesson_id: {
                    user_id: userProfile.id,
                    lesson_id: lessonId
                }
            },
            update: {
                score: finalScore,
                completed_at: new Date()
            },
            create: {
                user_id: userProfile.id,
                lesson_id: lessonId,
                score: finalScore
            }
        });

        // Update User Stats: Loop through all progress to sum XP
        // Need to refetch aggregate
        const allProgress = await prisma.lessonProgress.findMany({
            where: { user_id: userProfile.id }
        });

        const lessonsCompleted = allProgress.filter(p => p.score >= 0.6).length;
        const totalXP = Math.floor(allProgress.reduce((acc, p) => acc + (p.score * 10), 0));

        await prisma.userProfile.update({
            where: { id: userProfile.id },
            data: {
                lessons_completed: lessonsCompleted,
                total_xp: totalXP,
                last_active_date: new Date()
            }
        });

        // 3. Update Skill Vector (Simple Adaptive Logic)
        // The lesson fetch is now above, so we can use the 'lesson' variable directly.
        if (lesson && lesson.skills_targeted) {
            const targeted = lesson.skills_targeted as Record<string, number>;
            // currentVector is already defined above
            // const currentVector = (userProfile.skill_vector as Record<string, number>) || { reading: 0, writing: 0, speaking: 0 };

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
                    skill_vector: newVector,
                    streak_days: newStreak,
                    last_active_date: now
                }
            });
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to save progress' });
    }
}
