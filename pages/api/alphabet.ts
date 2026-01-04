// pages/api/alphabet.ts
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const supabase = createServerSupabaseClient({ req, res });

    if (req.method === 'GET') {
        // Fetch all alphabet lessons
        const { data, error } = await supabase.from('alphabet').select('*').order('lesson_order');
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    }

    else if (req.method === 'POST') {
        // Create a new alphabet lesson
        const { error } = await supabase.from('alphabet').insert(req.body);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json({ message: 'Created successfully' });
    }

    else if (req.method === 'PUT') {
        // Update an alphabet lesson
        const { id, ...updates } = req.body;
        const { error } = await supabase.from('alphabet').update(updates).eq('id', id);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ message: 'Updated successfully' });
    }

    else if (req.method === 'DELETE') {
        // Delete an alphabet lesson
        const { id } = req.body;
        const { error } = await supabase.from('alphabet').delete().eq('id', id);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ message: 'Deleted successfully' });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}