import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { Prisma } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Development only' });
    }

    try {
        console.log('Starting seed...');

        // 1. Cleanup: Delete lessons (this will cascade delete progress)
        // Check if cleanup is requested via query param? default to yes for now
        await prisma.lesson.deleteMany({});
        console.log('Cleaned up existing lessons.');

        // 2. Define Lessons Data
        const lessonsData = [
            {
                id: 1,
                lesson_order: 1,
                title: 'The Kashmiri Alphabet',
                description: 'Learn the core vowels and consonants of the Perso-Arabic script.',
                complexity: 1.0,
                skills_targeted: { reading: 1.0, speaking: 0.2 },
                content: {
                    type: 'phonetic',
                    letters: [
                        { char: 'ا', name: 'Alif', audio: '/audio/alif.mp3' },
                        { char: 'ب', name: 'Be', audio: '/audio/be.mp3' },
                        { char: 'پ', name: 'Pe', audio: '/audio/pe.mp3' },
                        { char: 'ت', name: 'Te', audio: '/audio/te.mp3' }
                    ]
                },
            },
            {
                id: 2,
                lesson_order: 2,
                title: 'Basic Greetings',
                description: 'Saying hello and goodbye in Kashmiri.',
                complexity: 1.5,
                skills_targeted: { speaking: 0.8, listening: 0.8 },
                content: {
                    type: 'dialogue',
                    lines: [
                        { speaker: 'A', text: 'Assalamu Alaikum', meaning: 'Peace be upon you' },
                        { speaker: 'B', text: 'Walaikum Assalam', meaning: 'And upon you peace' },
                        { speaker: 'A', text: 'Varay chhu?', meaning: 'Are you well?' }
                    ]
                },
            },
            {
                id: 3,
                lesson_order: 3,
                title: 'Numbers 1-10',
                description: 'Counting in Kashmiri.',
                complexity: 2.0,
                skills_targeted: { speaking: 0.5, reading: 0.5 },
                content: {
                    type: 'list',
                    items: [
                        { text: 'Akh', meaning: 'One' },
                        { text: 'Zah', meaning: 'Two' },
                        { text: 'Treh', meaning: 'Three' }
                    ]
                },
            },
            {
                id: 4,
                lesson_order: 4,
                title: 'Introducing Yourself',
                description: 'Constructing full sentences to say who you are.',
                complexity: 3.5,
                skills_targeted: { grammar: 0.6, speaking: 0.6 },
                content: {
                    type: 'list',
                    items: [
                        { text: 'Bah chhus Sulaiman', meaning: 'I am Sulaiman' },
                        { text: 'Tsah chhuk koshur', meaning: 'You are Kashmiri' }
                    ]
                },
            }
        ];

        // 3. Insert/Upsert Lessons
        for (const lesson of lessonsData) {
            await prisma.lesson.upsert({
                where: { id: lesson.id },
                update: {
                    lesson_order: lesson.lesson_order,
                    title: lesson.title,
                    description: lesson.description,
                    complexity: lesson.complexity,
                    skills_targeted: lesson.skills_targeted as Prisma.JsonObject,
                    content: lesson.content as Prisma.JsonObject,
                },
                create: {
                    id: lesson.id,
                    lesson_order: lesson.lesson_order,
                    title: lesson.title,
                    description: lesson.description,
                    complexity: lesson.complexity,
                    skills_targeted: lesson.skills_targeted as Prisma.JsonObject,
                    content: lesson.content as Prisma.JsonObject,
                }
            });
            console.log(`Seeded lesson: ${lesson.title}`);
        }

        return res.status(200).json({ success: true, message: 'Database seeded successfully.' });

    } catch (error: any) {
        console.error('Seed Error:', error);
        // Return explicit error message to the client
        return res.status(500).json({
            error: 'Failed to seed',
            details: error.message || error.toString(),
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
