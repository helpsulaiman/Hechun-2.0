import type { NextApiRequest, NextApiResponse } from 'next';
import { MOCK_LESSONS } from '../../../../lib/data/lessons';

/**
 * Development-only endpoint for testing lesson fetching with mock data
 * @deprecated Use production endpoints that fetch from database
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only available in development
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ error: 'Not found' });
    }

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
