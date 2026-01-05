import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@supabase/auth-helpers-react';
import DashboardLayout from '../../components/DashboardLayout'; // Assuming using dashboard layout or similar
import Layout from '../../components/Layout';
import { fetchLessonWithSteps, submitLessonProgress } from '../../lib/learning-api';
import { LearningLesson, LessonStep } from '../../types/learning';
import { ArrowLeft, CheckCircle, PlayCircle, BookOpen, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PhoneticLesson from '../../components/lesson/PhoneticLesson';
import DialogueLesson from '../../components/lesson/DialogueLesson';
import ListLesson from '../../components/lesson/ListLesson';
import TeachStep from '../../components/lesson/TeachStep';
import QuizStep from '../../components/lesson/QuizStep';

export default function LessonPlayer() {
    const router = useRouter();
    const { id } = router.query;
    const user = useUser();

    const [lesson, setLesson] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showSparkle, setShowSparkle] = useState(false);
    const [progress, setProgress] = useState(0);
    const [stepIndex, setStepIndex] = useState(0);
    const [canAdvance, setCanAdvance] = useState(false);

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
                const res = await fetch(`/api/lessons/${id}`); // We will create this
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
                {/* Progress Bar for Structured Lessons */}
                {lesson.content?.type === 'structured' && (
                    <div className="mb-6 bg-white/10 h-2 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-500 transition-all duration-500 ease-out"
                            style={{ width: `${((stepIndex + 1) / lesson.content.steps.length) * 100}%` }}
                        />
                    </div>
                )}

                {/* Content Area */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 min-h-[400px] relative overflow-hidden flex flex-col justify-center">
                    {/* Dynamic Content Renderer */}
                    {lesson.content?.type === 'structured' ? (
                        <div key={stepIndex} className="w-full">
                            {(() => {
                                const step = lesson.content.steps[stepIndex];
                                if (!step) return <div>Step not found</div>;

                                if (step.type === 'teach') {
                                    // Auto-enable advance for read-only steps
                                    if (!canAdvance) setCanAdvance(true);
                                    return <TeachStep content={step.content} />;
                                }
                                if (step.type.startsWith('quiz')) {
                                    return <QuizStep
                                        content={step.content}
                                        onComplete={(success) => {
                                            if (success) {
                                                setCanAdvance(true);
                                                setShowSparkle(true); // Sparkle on every correct quiz answer?
                                                // Actually user said "sparkles... once after a lesson is complete" OR "next lesson... sparkles".
                                                // "next lesson/complete lesson button sparkles/shines once after a lesson is complete. This should only be in quizes"
                                                // I will sparkle the button when it becomes active or when clicked for completion.
                                                // I'll keep the sparkle on the button itself.
                                            }
                                        }}
                                    />;
                                }
                                return <div>Unknown step type: {step.type}</div>;
                            })()}
                        </div>
                    ) : (
                        <>
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
                            {(!lesson.content || !['phonetic', 'dialogue', 'list', 'structured'].includes(lesson.content.type)) && (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                    <div className="prose prose-invert max-w-none text-center">
                                        <BookOpen className="w-12 h-12 mb-4 opacity-50 mx-auto" />
                                        <p>Content type: {lesson.content?.type || 'Unknown'}</p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-8 flex justify-end relative">
                    {/* Sparkle Overlay */}
                    <AnimatePresence>
                        {showSparkle && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1.5, opacity: 0 }}
                                transition={{ duration: 1 }}
                                className="absolute top-0 right-0 -mr-4 -mt-4 pointer-events-none text-yellow-400 z-50 animate-spin"
                            >
                                <Sparkles className="w-16 h-16 fill-current" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {lesson.content?.type === 'structured' ? (
                        <button
                            className={`
                                px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center gap-2 
                                disabled:opacity-50 disabled:cursor-not-allowed
                                ${showSparkle ? 'bg-yellow-500 text-white shadow-yellow-500/50 scale-105' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'}
                            `}
                            disabled={!canAdvance || submitting}
                            onClick={async () => {
                                if (stepIndex < lesson.content.steps.length - 1) {
                                    // Next Step
                                    setStepIndex(prev => prev + 1);
                                    setCanAdvance(false); // Reset for next step
                                    setShowSparkle(false);
                                } else {
                                    // Complete Lesson
                                    setSubmitting(true);

                                    // Sparkle on finish? 
                                    if (lesson.content.steps[stepIndex].type.startsWith('quiz')) {
                                        setShowSparkle(true);
                                        await new Promise(r => setTimeout(r, 1000));
                                    } else {
                                        await new Promise(r => setTimeout(r, 300));
                                    }

                                    // ... Submit Logic ...
                                    try {
                                        if (user) {
                                            await fetch('/api/progress', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ lessonId: lesson.id, score: 1.0 })
                                            });
                                        } else {
                                            // Guest Logic (Duplicated for brevity, ideally extracted)
                                            // ... existing guest logic ...
                                            const progressKey = 'hechun_guest_progress_counts';
                                            const legacyKey = 'hechun_guest_progress';
                                            let progressCounts: Record<string, number> = {};
                                            const storedCounts = localStorage.getItem(progressKey);
                                            if (storedCounts) progressCounts = JSON.parse(storedCounts);
                                            else {
                                                const legacy = localStorage.getItem(legacyKey);
                                                if (legacy) { const arr = JSON.parse(legacy); arr.forEach((id: string) => { progressCounts[id] = 1; }); }
                                            }
                                            const currentCount = progressCounts[lesson.id] || 0;
                                            progressCounts[lesson.id] = currentCount + 1;
                                            localStorage.setItem(progressKey, JSON.stringify(progressCounts));

                                            // Basic skill update
                                            const skillsKey = 'hechun_guest_skills';
                                            const localSkills = localStorage.getItem(skillsKey);
                                            const currentVector = localSkills ? JSON.parse(localSkills) : { reading: 10, writing: 10, speaking: 10 };
                                            localStorage.setItem(skillsKey, JSON.stringify(currentVector));
                                        }
                                        router.push('/');
                                    } catch (e) {
                                        console.error(e);
                                        router.push('/');
                                    }
                                }
                            }}
                        >
                            {stepIndex < lesson.content.steps.length - 1 ? (
                                <>Continue <ChevronRight className="w-5 h-5" /></>
                            ) : (
                                <>{showSparkle ? 'Great Job!' : 'Complete Lesson'} <CheckCircle className="w-5 h-5" /></>
                            )}
                        </button>
                    ) : (
                        // Standard Button for Legacy Types
                        <button
                            className={`
                                px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center gap-2 
                                disabled:opacity-50 disabled:cursor-not-allowed
                                ${showSparkle ? 'bg-yellow-500 text-white shadow-yellow-500/50 scale-105' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'}
                            `}
                            disabled={submitting}
                            onClick={async () => {
                                setSubmitting(true);

                                // Check for Quiz Type
                                const isQuiz = ['quiz', 'quiz_easy', 'test'].includes(lesson.content?.type || '');

                                if (isQuiz) {
                                    setShowSparkle(true);
                                    // Wait for sparkle
                                    await new Promise(r => setTimeout(r, 1000));
                                } else {
                                    // Just a small delay for feel
                                    await new Promise(r => setTimeout(r, 300));
                                }

                                // Submit Logic (Duplicated)
                                try {
                                    if (user) {
                                        // Authenticated: Save to DB
                                        await fetch('/api/progress', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ lessonId: lesson.id, score: 1.0 })
                                        });
                                    } else {
                                        // Guest: Save to LocalStorage
                                        const progressKey = 'hechun_guest_progress_counts';
                                        const legacyKey = 'hechun_guest_progress';

                                        let progressCounts: Record<string, number> = {};

                                        const storedCounts = localStorage.getItem(progressKey);
                                        if (storedCounts) {
                                            progressCounts = JSON.parse(storedCounts);
                                        } else {
                                            const legacy = localStorage.getItem(legacyKey);
                                            if (legacy) {
                                                const arr = JSON.parse(legacy);
                                                arr.forEach((id: string) => { progressCounts[id] = 1; });
                                            }
                                        }

                                        const currentCount = progressCounts[lesson.id] || 0;
                                        let gainFactor = 0;
                                        if (currentCount === 0) gainFactor = 1.0;
                                        else if (currentCount === 1) gainFactor = 0.15;
                                        else if (currentCount === 2) gainFactor = 0.05;
                                        else gainFactor = 0.0;

                                        progressCounts[lesson.id] = currentCount + 1;
                                        localStorage.setItem(progressKey, JSON.stringify(progressCounts));

                                        const legacyList = Object.keys(progressCounts);
                                        localStorage.setItem(legacyKey, JSON.stringify(legacyList));

                                        if (lesson.skills_targeted && gainFactor > 0) {
                                            const skillsKey = 'hechun_guest_skills';
                                            const localSkills = localStorage.getItem(skillsKey);
                                            const currentVector = localSkills ? JSON.parse(localSkills) : { reading: 10, writing: 10, speaking: 10 };
                                            const targeted = lesson.skills_targeted;
                                            const score = 1.0;

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
                            {showSparkle ? 'Great Job!' : 'Complete Lesson'} <CheckCircle className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </Layout>
    );
}
