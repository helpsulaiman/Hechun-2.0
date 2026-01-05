import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { fetchLessons } from '../lib/learning-api';
import { LearningLesson } from '../types/learning';
import styles from '../styles/learn.module.css';
import LevelNode from '../components/hechun/LevelNode';
import ThemeImage from '../components/ThemeImage';
import ScrollingBanner from '../components/ui/ScrollingBanner';
import FeedbackButton from '../components/ui/FeedbackButton';

const HistoryPage: React.FC = () => {
    const user = useUser();
    const supabase = useSupabaseClient();
    const [lessons, setLessons] = useState<LearningLesson[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchLessons(supabase, user?.id);
                // Filter for completed lessons only
                const completed = data.filter(l => (l.user_score || 0) >= 0.6);
                setLessons(completed);
            } catch (error) {
                console.error('Failed to load history:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user, supabase]);

    const totalXP = lessons.reduce((acc, l) => acc + (l.user_score ? 10 : 0), 0);

    return (
        <Layout title="History - Your Journey" fullWidth={true}>
            <div className={styles.learnContainer}>

                {/* Header Section */}
                <div className={styles.heroSection}>
                    <h1 className={styles['page-title-styled']}>
                        Your <span className={styles['gradient-text']}>History</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        A record of all the lessons you have mastered.
                    </p>

                    <div className="flex justify-center gap-4 mt-4">
                        <div className={styles.statItem}>
                            <i className="fas fa-check-circle text-green-500 text-xl"></i>
                            <span>{lessons.length} Completed</span>
                        </div>
                        <div className={styles.statItem}>
                            <i className="fas fa-bolt text-yellow-500 text-xl"></i>
                            <span>{totalXP} XP Earned</span>
                        </div>
                    </div>
                </div>

                {/* Path Section (Only Completed) */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : lessons.length > 0 ? (
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
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        <p className="text-xl mb-4">No completed lessons yet.</p>
                        <Link href="/" className="text-indigo-500 hover:underline">
                            Start your first lesson on the Home page!
                        </Link>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default HistoryPage;
