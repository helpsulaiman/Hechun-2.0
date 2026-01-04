import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { prisma } from '../../../lib/prisma';
import { UserProfile } from '../../../types/hechun';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const supabase = createPagesServerClient({ req, res });
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const userId = session?.user?.id;
    // Guest handling: For now, we only support Algo for authed users. 
    // Guests would need to send their "completed lesson IDs" in the body.
    const guestSkills = req.body.guestSkills;

    if (!userId && !guestSkills) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // 1. Get User State
        let userSkills = { reading: 0, writing: 0, speaking: 0 };
        let completedLessonIds: string[] = [];

        if (userId) {
            const profile = await prisma.userProfile.findUnique({
                where: { user_id: userId },
                include: { progress: true }
            });

            if (profile && profile.skill_vector) {
                userSkills = profile.skill_vector as any;
            }

            completedLessonIds = profile?.progress.map(p => p.lesson_id) || [];
        } else if (guestSkills) {
            userSkills = guestSkills;
            // Guests send completed IDs in body? For MVP assume 0 completed.
            completedLessonIds = req.body.completedIds || [];
        }

        // 2. Fetch All Lessons with Prerequisites
        const lessons = await prisma.lesson.findMany({
            include: {
                prerequisites: true
            }
        });

        // 3. Filter Available Lessons
        const availableLessons = lessons.filter(lesson => {
            // a. Not already completed
            if (completedLessonIds.includes(lesson.id)) return false;

            // b. Prerequisites met
            const prereqs = lesson.prerequisites.map(p => p.prerequisite_id);
            const allPrereqsMet = prereqs.every(id => completedLessonIds.includes(id));

            return allPrereqsMet;
        });

        if (availableLessons.length === 0) {
            return res.status(200).json({ message: 'No more lessons available!', completed: true });
        }

        // 4. Scoring Algorithm (Heuristic)
        // Calculate "Relevance" based on skill gap.
        // We want the lesson where complexity is slightly higher than current skill (Comprehensible Input + 1)

        // Average skill score for simplicity
        const userLevel = (userSkills.reading + userSkills.writing + userSkills.speaking) / 3;

        const scoredLessons = availableLessons.map(lesson => {
            // Distance from "Ideal Zone" (UserLevel + 5)
            // We want Complexity ≈ UserLevel + 5
            const targetComplexity = userLevel + 5;
            const distance = Math.abs(lesson.complexity_score - targetComplexity);

            return { lesson, score: distance };
        });

        // Sort by smallest distance (closest match)
        scoredLessons.sort((a, b) => a.score - b.score);

        // Return the best match
        return res.status(200).json({
            lesson: scoredLessons[0].lesson,
            debug: {
                userLevel,
                matchScore: scoredLessons[0].score
            }
        });

    } catch (error) {
        console.error('Next Lesson Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
