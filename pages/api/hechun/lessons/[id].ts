import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const lesson = await prisma.lesson.findUnique({
            where: { id: String(id) },
        });

        if (!lesson) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        return res.status(200).json(lesson);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
