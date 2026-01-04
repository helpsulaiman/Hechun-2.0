// pages/api/lessons.ts
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const supabase = createServerSupabaseClient({ req, res });

    if (req.method === 'GET') {
        const { data, error } = await supabase.from('lessons').select('*').order('id');
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    }

    if (req.method === 'POST') {
        const { error } = await supabase.from('lessons').insert(req.body);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json({ message: 'Created successfully' });
    }

    if (req.method === 'PUT') {
        const { id, ...updates } = req.body;
        const { error } = await supabase.from('lessons').update(updates).eq('id', id);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ message: 'Updated successfully' });
    }

    if (req.method === 'DELETE') {
        const { id } = req.body;
        const { error } = await supabase.from('lessons').delete().eq('id', id);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ message: 'Deleted successfully' });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}