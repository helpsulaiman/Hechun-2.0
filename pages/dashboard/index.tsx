// pages/dashboard/index.tsx
import React from 'react';
import Head from 'next/head';
import DashboardLayout from '@/components/DashboardLayout';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import SpotlightCard from '@/components/SpotlightCard';
import { Layers, Users } from 'lucide-react';
import { MiniChart } from '@/components/ui/mini-chart';

const DashboardOverviewPage: React.FC = () => {
    // Fetch stats from Convex
    const stats = useQuery(api.dashboard.getStats);

    const isLoading = stats === undefined;
    const lessonsCount = stats?.lessonsCount || 0;
    const usersCount = stats?.usersCount || 0;
    const chartData = stats?.chartData || [];

    return (
        <>
            <Head>
                <title>Dashboard - Hečhun</title>
            </Head>
            <DashboardLayout>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Overview</h1>
                    <p className="text-muted-foreground">Welcome back, Admin. Here's what's happening today.</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Activity Chart - Spans 2 Columns */}
                        <div className="col-span-1 md:col-span-2 h-auto">
                            <MiniChart data={chartData} title="Weekly Activity" description="Active Users (Mock)" unit="users" />
                        </div>

                        {/* Total Lessons */}
                        <SpotlightCard className="h-full col-span-1" style={{ background: 'var(--card)' }}>
                            <div className="p-6 relative h-full flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                                        <Layers className="w-6 h-6" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-muted-foreground font-medium text-sm">Total Lessons</h2>
                                    <p className="text-4xl font-bold mt-2 text-foreground">{lessonsCount}</p>
                                </div>
                            </div>
                        </SpotlightCard>

                        {/* Registered Users */}
                        <SpotlightCard className="h-full col-span-1" style={{ background: 'var(--card)' }}>
                            <div className="p-6 relative h-full flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl text-pink-600 dark:text-pink-400">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <span className="flex items-center text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                                        Total
                                    </span>
                                </div>
                                <div>
                                    <h2 className="text-muted-foreground font-medium text-sm">Registered Users</h2>
                                    <p className="text-4xl font-bold mt-2 text-foreground">{usersCount}</p>
                                </div>
                            </div>
                        </SpotlightCard>
                    </div>
                )}
            </DashboardLayout>
        </>
    );
};

export default DashboardOverviewPage;