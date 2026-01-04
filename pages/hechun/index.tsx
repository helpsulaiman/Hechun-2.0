import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { fetchLevelsWithLessons } from '../../lib/learning-api';
import { LearningLevel, LearningLesson } from '../../types/learning';
import styles from '../../styles/learn.module.css';
import LevelNode from '../../components/hechun/LevelNode';
import ThemeImage from '../../components/ThemeImage';
import ScrollingBanner from '../../components/ui/ScrollingBanner';
import FeedbackButton from '../../components/ui/FeedbackButton';

const HechunPage: React.FC = () => {
    const user = useUser();
    const supabase = useSupabaseClient();
    const [levels, setLevels] = useState<LearningLevel[]>([]);
    const [loading, setLoading] = useState(true);

    // Flatten all lessons into a single array for the path
    const [allLessons, setAllLessons] = useState<LearningLesson[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchLevelsWithLessons(supabase, user?.id);
                setLevels(data);

                // Flatten lessons
                let flattened: LearningLesson[] = [];
                data.forEach(level => {
                    if (level.lessons) {
                        flattened.push(...level.lessons);
                    }
                });

                // Lessons are now driven purely by DB data seeded via SQL
                setAllLessons(flattened);

                setAllLessons(flattened);

            } catch (error) {
                console.error('Failed to load learning path:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user, supabase]);

    const totalStars = allLessons.reduce((acc, lesson) => acc + (lesson.user_stars || 0), 0);

    return (
        <Layout title="Hechun - Learn Kashmiri" fullWidth={true}>
            <ScrollingBanner text="WORK IN PROGRESS • HEČHUN • WORK IN PROGRESS" />
            <FeedbackButton />
            <div className={styles.learnContainer}>

                {/* Hero / Header Section */}
                <div className={styles.heroSection}>
                    <div className={`flex justify-center mb-6`}>
                        <div style={{ width: 400, height: 400 }} className={styles.logoContainer}>
                            <ThemeImage
                                srcLight="https://hdbmcwmgolmxmtllaclx.supabase.co/storage/v1/object/public/images/Hechun_L.png"
                                srcDark="https://hdbmcwmgolmxmtllaclx.supabase.co/storage/v1/object/public/images/Hechun_D.png"
                                alt="Hechun"
                                width={400}
                                height={400}
                                style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                            />
                        </div>
                    </div>

                    <h1 className={styles['page-title-styled']}>
                        Your <span className={styles['gradient-text']}>Journey</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Master Kashmiri step by step. Complete lessons to earn stars and unlock new levels.
                    </p>

                    <div className="flex flex-col items-center gap-4">
                        <div className={styles.statsBar}>
                            <div className={styles.statItem}>
                                <i className="fas fa-star text-yellow-500 text-xl"></i>
                                <span>{totalStars} Stars</span>
                            </div>
                            <div className={styles.statItem}>
                                <i className="fas fa-crown text-purple-500 text-xl"></i>
                                <span>Level {levels.length > 0 ? levels[0].id : 1}</span>
                            </div>
                        </div>

                        <Link href="/leaderboard" className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                            <i className="fas fa-trophy"></i>
                            Leaderboard
                        </Link>
                    </div>
                </div>

                {/* Path Section */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className={styles.pathContainer}>
                        {/* Lessons Nodes */}
                        {allLessons.map((lesson, index) => {
                            // Determine status
                            // Logic: If previous lesson is completed (3 stars? or just completed?), unlock this one.
                            // For MVP simplicity: if it's the first one, or previous one has stars, it's unlocked.
                            // Real logic might need 'is_locked' from DB or stricter rules.

                            // Using the is_locked prop from API if available, else infer
                            let status: 'locked' | 'unlocked' | 'completed' = 'locked';

                            if (lesson.is_locked || lesson.title === 'Coming Soon') {
                                status = 'locked';
                            } else if ((lesson.user_stars || 0) > 0) {
                                status = 'completed';
                            } else {
                                status = 'unlocked';
                            }

                            return (
                                <LevelNode
                                    key={lesson.id}
                                    lesson={lesson}
                                    status={status}
                                    position={index % 2 === 0 ? 'left' : 'right'}
                                    index={index}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default HechunPage;
