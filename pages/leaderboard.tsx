import React, { useEffect, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import Layout from '../components/Layout';
import ThemeImage from '../components/ThemeImage';
import { fetchLeaderboard } from '../lib/learning-api';

import { UserStats } from '../types/learning';

const LeaderboardPage: React.FC = () => {
    const supabase = useSupabaseClient();
    const user = useUser();
    const [users, setUsers] = useState<UserStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'all_time'>('all_time');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadLeaderboard = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchLeaderboard(supabase, period, user?.id);
                setUsers(data);
            } catch (err: any) {
                console.error('Failed to load leaderboard:', err);

                let message = 'Failed to load leaderboard. Please try again later.';
                const errStr = err.message || err.toString();

                if (errStr.includes('Failed to fetch') || errStr.includes('Network request failed')) {
                    message = 'Unable to connect to the server. Please check your internet connection.';
                } else if (errStr.includes('500') || errStr.includes('503')) {
                    message = 'Our servers are experiencing issues. We are working on it!';
                } else if (errStr.includes('404')) {
                    message = 'Leaderboard service is currently unavailable.';
                }

                setError(message);
            } finally {
                setLoading(false);
            }
        };

        loadLeaderboard();
    }, [period]);

    return (
        <Layout title="Leaderboard - Hechun">
            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* ... */}
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-4">
                        <ThemeImage
                            srcLight="https://hdbmcwmgolmxmtllaclx.supabase.co/storage/v1/object/public/images/Hechun_L.png"
                            srcDark="https://hdbmcwmgolmxmtllaclx.supabase.co/storage/v1/object/public/images/Hechun_D.png"
                            alt="Hechun"
                            width={300}
                            height={150}
                            className="w-40 sm:w-64 md:w-80 h-auto"
                            style={{ objectFit: 'contain' }}
                        />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">🏆 Leaderboard</h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        See who&apos;s mastering Kashmiri the fastest!
                    </p>


                </div>

                {/* Period Selector */}
                <div className="flex justify-center gap-2 mb-8">
                    {(['daily', 'weekly', 'all_time'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${period === p
                                ? 'bg-orange-600 text-white shadow-md transform scale-105'
                                : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                                }`}
                        >
                            {p.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-20">Loading rankings...</div>
                ) : error ? (
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
                        <p className="text-red-600 dark:text-red-400 font-medium mb-2">😕 Warning</p>
                        <p className="text-gray-600 dark:text-gray-300">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-white dark:bg-gray-800 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Current User Rank Card */}
                        {(() => {
                            // Calculate ranks with tie handling
                            let currentRank = 1;
                            const usersWithRank = users.map((u, i) => {
                                if (i > 0 && u.total_stars < users[i - 1].total_stars) {
                                    currentRank = i + 1;
                                }
                                return { ...u, rank: currentRank };
                            });

                            // Find current user OR guest user
                            const currentUser = usersWithRank.find(u => u.user_id === user?.id || u.user_id === 'guest');

                            if (currentUser) {
                                return (
                                    <>
                                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-[1.02] transition-transform">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-indigo-100 font-medium mb-1">Your Current Rank</p>
                                                    <h2 className="text-3xl font-bold">#{currentUser.rank}</h2>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-indigo-100 font-medium mb-1">Total Stars</p>
                                                    <p className="text-2xl font-bold">{currentUser.total_stars} ★</p>
                                                </div>
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-indigo-100 font-medium mb-1">Lessons</p>
                                                    <p className="text-2xl font-bold">{currentUser.lessons_completed}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Prompt for Guest Users - Displayed BELOW the score card */}
                                        {currentUser.user_id === 'guest' && (
                                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-3 duration-500 text-center">
                                                <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                                                    Excellent work! 🌟
                                                </p>
                                                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                                                    Don't lose your progress. Log in now to save your score to the leaderboard.
                                                </p>
                                                <div className="flex justify-center gap-3">
                                                    <a href="/auth/login" className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors">
                                                        Log In to Save
                                                    </a>
                                                    <a href="/auth/register" className="px-4 py-2 bg-white dark:bg-gray-800 border border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 text-sm font-medium rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition-colors">
                                                        Sign Up
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                );
                            }
                            return null;
                        })()}

                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            {users.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No data yet. Be the first to complete a lesson!
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rank</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="hidden sm:table-cell px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Lessons</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Stars</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {(() => {
                                            let currentRank = 1;
                                            return users.map((item, index) => {
                                                // Update rank only if stars are different from previous user
                                                if (index > 0 && item.total_stars < users[index - 1].total_stars) {
                                                    currentRank = index + 1;
                                                }

                                                return (
                                                    <tr
                                                        key={item.user_id}
                                                        className={`transition-colors ${item.user_id === user?.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-750'}`}
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className={`
                              w-8 h-8 flex items-center justify-center rounded-full font-bold
                              ${currentRank === 1 ? 'bg-yellow-100 text-yellow-700' :
                                                                    currentRank === 2 ? 'bg-gray-100 text-gray-700' :
                                                                        currentRank === 3 ? 'bg-orange-100 text-orange-700' : 'text-gray-500'}
                            `}>
                                                                {currentRank}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="font-medium text-gray-900 dark:text-gray-100">
                                                                {item.username || `Learner #${index + 1}`}
                                                                {item.user_id === user?.id && <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">You</span>}
                                                            </div>
                                                        </td>
                                                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-right text-gray-500">
                                                            {item.lessons_completed}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-yellow-600 dark:text-yellow-400">
                                                            {item.total_stars} ★
                                                        </td>
                                                    </tr>
                                                );
                                            });
                                        })()}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default LeaderboardPage;
