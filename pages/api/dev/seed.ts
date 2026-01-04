import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Development only' });
    }

    try {
        // 1. Cleanup
        await prisma.lessonDependency.deleteMany({});
        await prisma.lesson.deleteMany({});

        // 2. Create Lessons
        // Alphabet (Root) - Phonetic Grid
        const alphabet = await prisma.lesson.create({
            data: {
                title: 'The Kashmiri Alphabet',
                description: 'Learn the core vowels and consonants of the Perso-Arabic script.',
                complexity_score: 10,
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
            }
        });

        // Greetings (Basic) - Dialogue
        const greetings = await prisma.lesson.create({
            data: {
                title: 'Basic Greetings',
                description: 'Saying hello and goodbye in Kashmiri.',
                complexity_score: 15,
                skills_targeted: { speaking: 0.8, listening: 0.8 },
                content: {
                    type: 'dialogue',
                    lines: [
                        { speaker: 'A', text: 'Assalamu Alaikum', meaning: 'Peace be upon you' },
                        { speaker: 'B', text: 'Walaikum Assalam', meaning: 'And upon you peace' },
                        { speaker: 'A', text: 'Varay chhu?', meaning: 'Are you well?' }
                    ]
                },
            }
        });

        // Numbers (Basic) - List
        const numbers = await prisma.lesson.create({
            data: {
                title: 'Numbers 1-10',
                description: 'Counting in Kashmiri.',
                complexity_score: 20,
                skills_targeted: { speaking: 0.5, reading: 0.5 },
                content: {
                    type: 'list',
                    items: [
                        { text: 'Akh', meaning: 'One' },
                        { text: 'Zah', meaning: 'Two' },
                        { text: 'Treh', meaning: 'Three' }
                    ]
                },
            }
        });

        // Sentences (Intermediate)
        const introSentence = await prisma.lesson.create({
            data: {
                title: 'Introducing Yourself',
                description: 'Constructing full sentences to say who you are.',
                complexity_score: 35,
                skills_targeted: { grammar: 0.6, speaking: 0.6 },
                content: {
                    type: 'list',
                    items: [
                        { text: 'Bah chhus Sulaiman', meaning: 'I am Sulaiman' },
                        { text: 'Tsah chhuk koshur', meaning: 'You are Kashmiri' }
                    ]
                },
            }
        });

        // 3. Create Dependencies
        // Greetings needs Alphabet (loosely, or maybe not? Let's say yes for graph testing)
        await prisma.lessonDependency.create({
            data: {
                lesson_id: greetings.id,
                prerequisite_id: alphabet.id
            }
        });

        // Intro needs Greetings
        await prisma.lessonDependency.create({
            data: {
                lesson_id: introSentence.id,
                prerequisite_id: greetings.id
            }
        });

        return res.status(200).json({ success: true, message: 'Database seeded with curriculum graph.' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to seed' });
    }
}
