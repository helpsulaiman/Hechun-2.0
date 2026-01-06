import type { NextApiRequest, NextApiResponse } from 'next';
import { MOCK_LESSONS } from '../../../lib/data/lessons';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    // Simulate Network Delay
    setTimeout(() => {
        if (typeof id === 'string' && MOCK_LESSONS[id]) {
            res.status(200).json(MOCK_LESSONS[id]);
        } else {
            res.status(404).json({ error: "Lesson not found" });
        }
    }, 500);
}
