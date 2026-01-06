import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { fetchLessons } from '../lib/learning-api';
import { LearningLesson } from '../types/learning';
import styles from '../styles/learn.module.css';
import LevelNode from '../components/hechun/LevelNode';

const HistoryPage: React.FC = () => {
    const user = useUser();
    const supabase = useSupabaseClient();
    const [activeTab, setActiveTab] = useState<'lessons' | 'concepts'>('lessons');
    const [concepts, setConcepts] = useState<{ term: string, meaning: string, lessonId: number, lessonTitle: string, type: string }[]>([]);
    const [lessons, setLessons] = useState<LearningLesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [xp, setXp] = useState(0);

    // --- EFFECT: Load Data ---
    useEffect(() => {
        let isMounted = true;

        const loadHistory = async () => {
            try {
                setLoading(true);
                let fetchedLessons: LearningLesson[] = [];

                if (user) {
                    // --- 1. LOGGED IN USER ---
                    const data = await fetchLessons(supabase, user.id);
                    fetchedLessons = data.filter(l => (l.user_score || 0) >= 0.6);
                } else {
                    // --- 2. GUEST USER ---
                    const progressKey = 'hechun_guest_progress_counts';
                    const localProgressRaw = localStorage.getItem(progressKey);
                    if (localProgressRaw) {
                        try {
                            const localProgress = JSON.parse(localProgressRaw);
                            fetchedLessons = Object.keys(localProgress).map((idStr, index) => ({
                                id: parseInt(idStr),
                                title: `Lesson ${idStr}`,
                                description: 'Completed as Guest',
                                lesson_order: index + 1,
                                content: {},
                                complexity: 1,
                                skills_targeted: {},
                                xp_reward: 10,
                                user_score: 1.0,
                                is_locked: false,
                                is_completed: true,
                                times_completed: localProgress[idStr]
                            }));
                        } catch (e) { }
                    }
                }

                if (isMounted) {
                    setLessons(fetchedLessons);

                    // XP Calculation
                    const totalXP = fetchedLessons.reduce((acc, l) => acc + (10 * (l.times_completed || 1)), 0);
                    setXp(totalXP);

                    // Extract Concepts
                    const extracted: any[] = [];
                    fetchedLessons.forEach(l => {
                        // 1. Check for Steps (Structured Lesson)
                        if (l.content?.steps && Array.isArray(l.content.steps)) {
                            l.content.steps.forEach((step: any) => {
                                if (step.type === 'teach' && step.content?.kashmiri_text) {
                                    extracted.push({
                                        term: step.content.kashmiri_text,
                                        meaning: step.content.translation || step.content.description,
                                        lessonId: l.id,
                                        lessonTitle: l.title,
                                        type: 'concept'
                                    });
                                }
                            });
                        }
                        // 2. Check for Dialogue Lines (Phrases)
                        if (l.content?.type === 'dialogue' && l.content.lines) {
                            // Only pick lines that look like vocab or short phrases? 
                            // For now, let's include lines as "Phrases"
                            l.content.lines.forEach((line: any) => {
                                if (line.text.split(' ').length <= 4) { // Heuristic: Short phrases only for dictionary
                                    extracted.push({
                                        term: line.text,
                                        meaning: line.meaning,
                                        lessonId: l.id,
                                        lessonTitle: l.title,
                                        type: 'phrase'
                                    });
                                }
                            });
                        }
                    });
                    setConcepts(extracted);
                }

            } catch (error) {
                console.error('History Load Error:', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadHistory();

        return () => { isMounted = false; };
    }, [user, supabase]);

    return (
        <Layout title="History - Your Journey" fullWidth={true}>
            <div className={`${styles.learnContainer} pt-24 md:pt-8`}>

                {/* Header Section */}
                <div className={styles.heroSection}>
                    <h1 className={styles['page-title-styled']}>
                        Your <span className={styles['gradient-text']}>Journey</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Track your progress and review what you've learned.
                    </p>

                    {/* Stats Bar */}
                    <div className="flex justify-center gap-4 mt-8">
                        <div className={styles.statsBar}>
                            <div className={styles.statItem}>
                                <i className="fas fa-check-circle text-green-500 text-xl"></i>
                                <span>{lessons.length} Completed</span>
                            </div>
                            <div className="w-px h-6 bg-border mx-2"></div>
                            <div className={styles.statItem}>
                                <i className="fas fa-bolt text-yellow-500 text-xl"></i>
                                <span>{xp} XP Earned</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex justify-center mt-8">
                        <div className="bg-muted p-1 rounded-full flex gap-1">
                            <button
                                onClick={() => setActiveTab('lessons')}
                                className={`px-6 py-2 rounded-full font-medium transition-all ${activeTab === 'lessons'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Previous Lessons
                            </button>
                            <button
                                onClick={() => setActiveTab('concepts')}
                                className={`px-6 py-2 rounded-full font-medium transition-all ${activeTab === 'concepts'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                What I've Learnt
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                        <p className="text-muted-foreground animate-pulse">Loading your history...</p>
                    </div>
                ) : (
                    <div className="min-h-[400px]">
                        {activeTab === 'lessons' ? (
                            lessons.length > 0 ? (
                                <div className={styles.pathContainer}>
                                    {lessons.map((lesson, index) => (
                                        <LevelNode
                                            key={lesson.id}
                                            lesson={lesson}
                                            status={'completed'}
                                            position={index % 2 === 0 ? 'left' : 'right'}
                                            index={index}
                                        />
                                    ))}
                                    <div className="text-center mt-12 mb-20">
                                        <p className="text-muted-foreground italic">
                                            "Knowledge is a garden; if it is not cultivated, it cannot be harvested."
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <EmptyState />
                            )
                        ) : (
                            // Concepts Tab
                            <div className="max-w-4xl mx-auto px-4 py-8">
                                {concepts.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {concepts.map((concept, idx) => (
                                            <div key={idx} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${concept.type === 'phrase' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                        }`}>
                                                        {concept.type}
                                                    </span>
                                                    <Link href={`/lesson/${concept.lessonId}`} className="text-xs text-muted-foreground hover:text-primary truncate max-w-[100px]">
                                                        {concept.lessonTitle}
                                                    </Link>
                                                </div>
                                                <h3 className="text-xl font-bold mb-1 text-primary">{concept.term}</h3>
                                                <p className="text-muted-foreground">{concept.meaning}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20">
                                        <div className="mb-4 text-4xl">📖</div>
                                        <h3 className="text-lg font-bold">No Concepts Yet</h3>
                                        <p className="text-muted-foreground">Complete lessons to build your dictionary.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

function EmptyState() {
    return (
        <div className="text-center py-20 max-w-md mx-auto px-4">
            <div className="mb-6 bg-muted/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                <i className="fas fa-history text-3xl text-muted-foreground opacity-50"></i>
            </div>
            <h3 className="text-xl font-bold mb-2">No Lessons Yet</h3>
            <p className="text-muted-foreground mb-8">
                Start your journey to master Kashmiri. Completed lessons will appear here.
            </p>
            <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold shadow-lg hover:opacity-90 transition-all hover:scale-105"
            >
                Start Learning
            </Link>
        </div>
    );
}

export default HistoryPage;
