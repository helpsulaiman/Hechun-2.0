import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@supabase/auth-helpers-react';
import Layout from '../../../components/Layout';
import { ArrowLeft, CheckCircle, PlayCircle, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import PhoneticLesson from '../../../components/lesson/PhoneticLesson';
import DialogueLesson from '../../../components/lesson/DialogueLesson';
import ListLesson from '../../../components/lesson/ListLesson';

export default function LessonPlayer() {
    const router = useRouter();
    const { id } = router.query;
    const user = useUser();

    const [lesson, setLesson] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!id) return;

        // Fetch lesson details
        // In a real app, you'd fetch /api/hechun/lesson/${id}
        // For MVP, we might mock or fetch if that endpoint exists. 
        // We haven't created a specific single-lesson GET endpoint yet, 
        // but let's assume we'll create it or use the graph data.

        // Let's create a quick fetcher
        const fetchLesson = async () => {
            try {
                // We need an endpoint for this. 
                // For now, let's mock it based on the Seed IDs if possible, 
                // or just fail gracefully.
                // Actually, I'll create the endpoint next.
                const res = await fetch(`/api/hechun/lessons/${id}`); // We will create this
                if (res.ok) {
                    const data = await res.json();
                    setLesson(data);
                } else {
                    // Fallback for demo if DB is empty or API missing
                    setLesson({
                        title: 'Loading Lesson...',
                        content: { type: 'text', body: 'Content is loading...' }
                    });
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchLesson();
    }, [id]);

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
            </Layout>
        )
    }

    if (!lesson) return <Layout><div className="p-10 text-center">Lesson not found</div></Layout>;

    return (
        <Layout title={lesson.title || 'Lesson'}>
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/')}
                        className="text-gray-500 hover:text-white flex items-center gap-2 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Path
                    </button>
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">{lesson.title}</h1>
                    <p className="text-xl text-gray-400">{lesson.description}</p>
                </div>

                {/* Content Area */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 min-h-[400px] relative overflow-hidden">
                    {/* Dynamic Content Renderer */}
                    {lesson.content?.type === 'phonetic' && (
                        <PhoneticLesson content={lesson.content} onComplete={() => { }} />
                    )}
                    {lesson.content?.type === 'dialogue' && (
                        <DialogueLesson content={lesson.content} />
                    )}
                    {lesson.content?.type === 'list' && (
                        <ListLesson content={lesson.content} />
                    )}

                    {/* Fallback for unknown/legacy types */}
                    {(!lesson.content || !['phonetic', 'dialogue', 'list'].includes(lesson.content.type)) && (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <div className="prose prose-invert max-w-none text-center">
                                <BookOpen className="w-12 h-12 mb-4 opacity-50 mx-auto" />
                                <p>Content type: {lesson.content?.type || 'Unknown'}</p>
                                <pre className="text-left text-xs bg-black/30 p-4 rounded overflow-auto max-w-xs">
                                    {JSON.stringify(lesson.content, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-8 flex justify-end">
                    <button
                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                        onClick={async () => {
                            setLoading(true);
                            try {
                                if (user) {
                                    // Authenticated: Save to DB
                                    await fetch('/api/hechun/progress', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ lessonId: lesson.id, score: 1.0 })
                                    });
                                } else {
                                    // Guest: Save to LocalStorage
                                    // A) Save Completion Count (Migration from Array -> Object)
                                    const progressKey = 'hechun_guest_progress_counts'; // New key for counts
                                    const legacyKey = 'hechun_guest_progress';

                                    let progressCounts: Record<string, number> = {};

                                    // Migration Logic: If legacy exists but new key doesn't, migrate
                                    const storedCounts = localStorage.getItem(progressKey);
                                    if (storedCounts) {
                                        progressCounts = JSON.parse(storedCounts);
                                    } else {
                                        const legacy = localStorage.getItem(legacyKey);
                                        if (legacy) {
                                            const arr = JSON.parse(legacy);
                                            // Assume 1 completion for all legacy items
                                            arr.forEach((id: string) => { progressCounts[id] = 1; });
                                        }
                                    }

                                    // Determine Factor based on existing count
                                    const currentCount = progressCounts[lesson.id] || 0;
                                    let gainFactor = 0;
                                    if (currentCount === 0) gainFactor = 1.0;
                                    else if (currentCount === 1) gainFactor = 0.15;
                                    else if (currentCount === 2) gainFactor = 0.05;
                                    else gainFactor = 0.0;

                                    // Increment and Save
                                    progressCounts[lesson.id] = currentCount + 1;
                                    localStorage.setItem(progressKey, JSON.stringify(progressCounts));

                                    // Keep legacy key updated for backward compatibility
                                    const legacyList = Object.keys(progressCounts);
                                    localStorage.setItem(legacyKey, JSON.stringify(legacyList));

                                    // B) Update Skill Vector (Client-side Math)
                                    if (lesson.skills_targeted && gainFactor > 0) {
                                        const skillsKey = 'hechun_guest_skills';
                                        const localSkills = localStorage.getItem(skillsKey);
                                        // Default to 10 if not found (matching logic in index.tsx)
                                        const currentVector = localSkills ? JSON.parse(localSkills) : { reading: 10, writing: 10, speaking: 10 };

                                        const targeted = lesson.skills_targeted;
                                        const score = 1.0; // Default score

                                        for (const [skill, weight] of Object.entries(targeted as Record<string, number>)) {
                                            const current = currentVector[skill] || 10;
                                            const gain = weight * 10 * score * gainFactor;
                                            currentVector[skill] = Math.round(current + gain);
                                        }
                                        localStorage.setItem(skillsKey, JSON.stringify(currentVector));
                                    }
                                }
                                router.push('/');
                            } catch (e) {
                                console.error(e);
                                router.push('/');
                            }
                        }}
                    >
                        Complete Lesson <CheckCircle className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </Layout>
    );
}
