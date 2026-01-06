
import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const supabase = createServerSupabaseClient({ req, res });

    // Check Auth & Admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const userProfile = await prisma.userProfile.findUnique({ where: { user_id: session.user.id } });
    if (!userProfile?.is_admin) return res.status(403).json({ error: 'Forbidden' });

    if (req.method === 'POST') {
        try {
            // Find max ID and Order
            const aggregations = await prisma.lesson.aggregate({
                _max: {
                    id: true,
                    lesson_order: true
                }
            });

            const nextId = (aggregations._max.id || 1000) + 1;
            const nextOrder = (aggregations._max.lesson_order || 0) + 1;

            const newLesson = await prisma.lesson.create({
                data: {
                    id: nextId,
                    lesson_order: nextOrder,
                    title: 'New Lesson',
                    description: 'Draft lesson description',
                    content: JSON.stringify({
                        type: 'structured',
                        steps: []
                    }),
                    complexity: 1.0,
                    skills_targeted: { reading: 1.0 },
                    xp_reward: 10
                }
            });

            return res.status(200).json(newLesson);
        } catch (e: any) {
            console.error(e);
            return res.status(500).json({ error: e.message });
        }
    }

    // LIST (GET) - Optional if we want to move logic here from client, but client uses supabase direct usually? 
    // Actually client in dashboard uses supabase generic query. 
    // We can leave GET unimplemented or return 405 for now if strictly for creation.
    // Client currently does: supabase.from('lessons')... so strictly speaking we don't *need* GET here yet.

    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
