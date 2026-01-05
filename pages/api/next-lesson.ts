import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { prisma } from '../../lib/prisma';
import { UserProfile } from '../../types/hechun';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const supabase = createPagesServerClient({ req, res });
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const userId = session?.user?.id;
    // Guest handling: For now, we only support Algo for authed users. 
    // Guests would need to send their "completed lesson IDs" in the body.
    const guestSkills = req.body.guestSkills;

    // Allow guest access (if no userId, and no guestSkills, assume new guest)
    // if (!userId && !guestSkills) {
    //    return res.status(401).json({ error: 'Unauthorized' });
    // }

    try {
        // 1. Get User State
        let userSkills = { reading: 0, writing: 0, speaking: 0 };
        let completedLessonIds: number[] = [];

        if (userId) {
            const profile = await prisma.userProfile.findUnique({
                where: { user_id: userId },
                include: { lessons: true }
            });

            if (profile && profile.skill_vector) {
                userSkills = profile.skill_vector as any;
            }

            completedLessonIds = profile?.lessons.map(p => p.lesson_id) || [];
        } else if (guestSkills) {
            userSkills = guestSkills;
            // Guests send completed IDs in body? For MVP assume 0 completed.
            completedLessonIds = req.body.completedIds || [];
        }

        // 2. Fetch All Lessons (Ordered)
        const lessons = await prisma.lesson.findMany({
            orderBy: { lesson_order: 'asc' }
        });

        // 3. Find First Incomplete Lesson
        const nextLesson = lessons.find(lesson => !completedLessonIds.includes(lesson.id));

        if (!nextLesson) {
            return res.status(200).json({ message: 'No more lessons available!', completed: true });
        }

        // Return the next lesson
        return res.status(200).json({
            lesson: nextLesson,
            debug: {
                matchScore: 0, // Not using complexity matching for linear path currently
                info: "Next lesson in linear sequence"
            }
        });

    } catch (error) {
        console.error('Next Lesson Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
