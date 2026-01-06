import React, { useEffect, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import Layout from '../components/Layout';
import ThemeImage from '../components/ThemeImage';
import { fetchLeaderboard } from '../lib/learning-api';
import { UserProfile } from '../types/learning';
import { GetStaticProps } from 'next';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { Crown, Medal, TrendingUp, Sparkles } from 'lucide-react';

export const getStaticProps: GetStaticProps = async () => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch leaderboard
    const allTimeLeaderboard = await fetchLeaderboard(supabase, 'all_time');

    return {
        props: {
            initialLeaderboard: allTimeLeaderboard,
        },
        revalidate: 60, // Revalidate every minute
    };
};

const LeaderboardPage: React.FC<{ initialLeaderboard: UserProfile[] }> = ({ initialLeaderboard }) => {
    const supabase = useSupabaseClient();
    const user = useUser();
    const [users, setUsers] = useState<UserProfile[]>(initialLeaderboard);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'all_time'>('all_time');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadLeaderboard = async () => {
            setLoading(true);
            setError(null);
            try {
                let data = await fetchLeaderboard(supabase, period);

                // Inject Guest Data if not logged in
                if (!user) {
                    const guestSkillsStr = localStorage.getItem('hechun_guest_skills');
                    const guestProgressStr = localStorage.getItem('hechun_guest_progress_counts');
                    const guestStreakStr = localStorage.getItem('hechun_guest_streak');

                    if (guestSkillsStr) {
                        const guestSkills = JSON.parse(guestSkillsStr);
                        const totalXP = Math.floor(
                            (guestSkills.reading || 0) +
                            (guestSkills.speaking || 0) +
                            (guestSkills.grammar || 0) +
                            (guestSkills.writing || 0)
                        );

                        let lessonCount = 0;
                        if (guestProgressStr) {
                            const counts = JSON.parse(guestProgressStr);
                            lessonCount = Object.keys(counts).length;
                        }

                        let streak = 0;
                        if (guestStreakStr) {
                            try {
                                const parsed = JSON.parse(guestStreakStr);
                                streak = parsed.currentStreak || 0;
                            } catch (e) { streak = 0; }
                        }

                        const guestUser: UserProfile = {
                            id: 'guest-local',
                            user_id: 'guest',
                            username: 'You (Guest)',
                            avatar_url: null,
                            total_xp: totalXP,
                            lessons_completed: lessonCount,
                            streak_days: streak || 1,
                            is_admin: false,
                            created_at: new Date().toISOString(),
                            email: null,
                            last_active_date: new Date().toISOString(),
                            skill_vector: guestSkills
                        };

                        data.push(guestUser);
                    }
                }

                setUsers(data);
            } catch (err: any) {
                console.error('Failed to load leaderboard:', err);
                setError('Failed to load rankings. Please check your connection.');
            } finally {
                setLoading(false);
            }
        };

        loadLeaderboard();
    }, [period, user, supabase]);

    // Sort users
    const sortedUsers = [...users].sort((a, b) => {
        if (period === 'all_time') return b.total_xp - a.total_xp;
        return b.streak_days - a.streak_days;
    });

    const topThree = sortedUsers.slice(0, 3);
    const rest = sortedUsers.slice(3);

    // Helper: Get Medal Color
    const getRankStyle = (rank: number) => {
        if (rank === 0) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/50'; // Gold
        if (rank === 1) return 'text-gray-400 bg-gray-400/10 border-gray-400/50';     // Silver
        if (rank === 2) return 'text-orange-400 bg-orange-400/10 border-orange-400/50'; // Bronze
        return 'text-gray-500 bg-gray-100 dark:bg-gray-800 border-transparent';
    };

    return (
        <Layout title="Leaderboard - Hechun" fullWidth={true}>
            <div className="min-h-screen bg-transparent pb-20">
                <div className="max-w-4xl mx-auto px-4 py-8 pt-24 md:pt-12">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="flex justify-center mb-6">
                            <ThemeImage
                                srcLight="https://hdbmcwmgolmxmtllaclx.supabase.co/storage/v1/object/public/images/Hechun_L.png"
                                srcDark="https://hdbmcwmgolmxmtllaclx.supabase.co/storage/v1/object/public/images/Hechun_D.png"
                                alt="Hechun"
                                width={180}
                                height={90}
                                className="w-32 md:w-40 h-auto"
                                style={{ objectFit: 'contain' }}
                            />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            Leaderboard
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Celebrating the champions of Kashmiri language preservation.
                        </p>
                    </div>

                    {/* Period Selector */}
                    <div className="flex justify-center mb-24">
                        <div className="bg-muted/50 p-1 rounded-full flex gap-1 border border-border">
                            {(['daily', 'weekly', 'all_time'] as const).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className={`
                                        px-6 py-2 rounded-full text-sm font-bold transition-all
                                        ${period === p
                                            ? 'bg-primary text-primary-foreground shadow-md'
                                            : 'text-muted-foreground hover:bg-background hover:text-foreground'
                                        }
                                    `}
                                >
                                    {p.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 py-10">{error}</div>
                    ) : (
                        <>
                            {/* --- PODIUM SECTION --- */}
                            {topThree.length > 0 && (
                                <div className="flex justify-center items-end gap-4 md:gap-8 mb-16 h-64 md:h-80">
                                    {/* Silver (Rank 2) */}
                                    {topThree[1] && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                            className="flex flex-col items-center"
                                        >
                                            <div className="mb-2 relative">
                                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-gray-300 overflow-hidden shadow-xl bg-muted flex items-center justify-center">
                                                    {topThree[1].user_id === 'guest' ? (
                                                        <span className="font-bold text-xs text-muted-foreground">You</span>
                                                    ) : (
                                                        <img src={topThree[1].avatar_url || `https://ui-avatars.com/api/?name=${topThree[1].username}&background=random`} alt="Rank 2" className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-300 text-gray-800 text-xs font-bold px-2 py-0.5 rounded-full border border-white">#2</div>
                                            </div>
                                            <div className="w-20 md:w-24 bg-gradient-to-t from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-t-lg shadow-lg flex flex-col justify-end items-center pb-4 h-32 md:h-40 border-t border-white/20">
                                                <span className="font-bold text-gray-600 dark:text-gray-300 truncate w-full text-center px-1 text-sm">{topThree[1].username}</span>
                                                <span className="text-xs text-muted-foreground font-mono">{topThree[1].total_xp} XP</span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Gold (Rank 1) */}
                                    {topThree[0] && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                            className="flex flex-col items-center z-10"
                                        >
                                            <div className="mb-3 relative">
                                                <Crown className="w-8 h-8 text-yellow-500 absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce" fill="#eab308" />
                                                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-yellow-400 overflow-hidden shadow-2xl ring-4 ring-yellow-400/20 bg-muted flex items-center justify-center">
                                                    {topThree[0].user_id === 'guest' ? (
                                                        <span className="font-bold text-sm text-muted-foreground">You</span>
                                                    ) : (
                                                        <img src={topThree[0].avatar_url || `https://ui-avatars.com/api/?name=${topThree[0].username}&background=random`} alt="Rank 1" className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-sm font-bold px-3 py-0.5 rounded-full border border-white">#1</div>
                                            </div>
                                            <div className="w-24 md:w-32 bg-gradient-to-t from-yellow-200 to-yellow-100 dark:from-yellow-900/40 dark:to-yellow-800/40 rounded-t-xl shadow-xl flex flex-col justify-end items-center pb-6 h-48 md:h-56 border-t border-yellow-400/30 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-yellow-400/5 animate-[pulse_3s_infinite]"></div>
                                                <span className="font-bold text-yellow-800 dark:text-yellow-200 text-lg truncate w-full text-center px-2">{topThree[0].username}</span>
                                                <span className="text-sm text-yellow-700 dark:text-yellow-300 font-mono font-bold">{topThree[0].total_xp} XP</span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Bronze (Rank 3) */}
                                    {topThree[2] && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                            className="flex flex-col items-center"
                                        >
                                            <div className="mb-2 relative">
                                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-orange-300 overflow-hidden shadow-xl bg-muted flex items-center justify-center">
                                                    {topThree[2].user_id === 'guest' ? (
                                                        <span className="font-bold text-xs text-muted-foreground">You</span>
                                                    ) : (
                                                        <img src={topThree[2].avatar_url || `https://ui-avatars.com/api/?name=${topThree[2].username}&background=random`} alt="Rank 3" className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-300 text-orange-900 text-xs font-bold px-2 py-0.5 rounded-full border border-white">#3</div>
                                            </div>
                                            <div className="w-20 md:w-24 bg-gradient-to-t from-orange-200 to-orange-100 dark:from-orange-900/40 dark:to-orange-800/40 rounded-t-lg shadow-lg flex flex-col justify-end items-center pb-4 h-24 md:h-32 border-t border-white/20">
                                                <span className="font-bold text-orange-800 dark:text-orange-200 truncate w-full text-center px-1 text-sm">{topThree[2].username}</span>
                                                <span className="text-xs text-orange-700 dark:text-orange-300 font-mono">{topThree[2].total_xp} XP</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {/* --- RANKING LIST --- */}
                            <div className="space-y-3">
                                {rest.map((rUser, index) => {
                                    const rank = index + 4;
                                    const isCurrentUser = rUser.user_id === user?.id || rUser.user_id === 'guest';

                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.05 }}
                                            key={rUser.user_id}
                                            className={`
                                                flex items-center p-4 rounded-2xl border transition-all
                                                ${isCurrentUser
                                                    ? 'bg-primary/10 border-primary/50 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] transform scale-[1.02]'
                                                    : 'bg-card border-border hover:border-primary/30 hover:shadow-md'
                                                }
                                            `}
                                        >
                                            <div className="w-12 text-center font-bold text-muted-foreground">#{rank}</div>

                                            <div className="mx-4">
                                                <div className="w-12 h-12 rounded-full bg-muted overflow-hidden border border-border flex items-center justify-center">
                                                    {rUser.user_id === 'guest' ? (
                                                        <span className="font-bold text-xs text-muted-foreground">You</span>
                                                    ) : (
                                                        <img src={rUser.avatar_url || `https://ui-avatars.com/api/?name=${rUser.username}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex-grow">
                                                <div className="font-bold text-foreground flex items-center gap-2">
                                                    {rUser.username || 'Learner'}
                                                    {isCurrentUser && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">You</span>}
                                                </div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                    <ThemeImage
                                                        srcLight="/flags/kashmir.png" // Fallback or use icon
                                                        srcDark="/flags/kashmir.png"
                                                        alt=""
                                                        width={16}
                                                        height={10}
                                                        className="inline opacity-0"
                                                    />
                                                    {rUser.lessons_completed} Lessons Completed
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="font-mono font-bold text-lg text-primary">{rUser.total_xp}</div>
                                                <div className="text-xs text-muted-foreground uppercase tracking-wider">XP</div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Guest Nudge */}
                            {!user && (
                                <div className="mt-8 text-center bg-card border border-border p-6 rounded-2xl shadow-sm">
                                    <p className="text-muted-foreground mb-4">You are currently viewing as a Guest. Log in to save your spot on the leaderboard!</p>
                                    <a href="/auth/login" className="inline-block px-6 py-2 bg-primary text-primary-foreground font-bold rounded-full hover:opacity-90 transition-opacity">
                                        Log In / Sign Up
                                    </a>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default LeaderboardPage;
