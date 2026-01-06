// pages/dashboard/index.tsx
import React from 'react';
import Head from 'next/head';
import DashboardLayout from '../../components/DashboardLayout';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { GetServerSidePropsContext } from 'next';
import SpotlightCard from '../../components/SpotlightCard';
import { Layers, Users } from 'lucide-react';
import { MiniChart } from '../../components/ui/mini-chart';
import { prisma } from '../../lib/prisma';

interface DashboardProps {
    lessonsCount: number;
    usersCount: number;
    chartData: { label: string; value: number }[];
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
    const supabase = createServerSupabaseClient(ctx);
    const { count: lessonsCount } = await supabase.from('lessons').select('*', { count: 'exact', head: true });
    const { count: usersCount } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true });

    // Fetch Last 7 Days Activity
    const daysToView = 7;
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - daysToView);

    const progress = await prisma.lessonProgress.findMany({
        where: { completed_at: { gte: pastDate } },
        select: { completed_at: true }
    });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const chartData = [];

    // Create array ensuring order from 7 days ago to today (or past 6 days + today)
    for (let i = daysToView - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayLabel = weekDays[d.getDay()];
        const key = d.toISOString().split('T')[0]; // Match on YYYY-MM-DD

        // Count for this day (ensure completed_at is not null)
        const count = progress.filter(p => p.completed_at && p.completed_at.toISOString().split('T')[0] === key).length;

        chartData.push({ label: dayLabel, value: count });
    }

    return {
        props: {
            lessonsCount: lessonsCount || 0,
            usersCount: usersCount || 0,
            chartData
        },
    };
};

const DashboardOverviewPage: React.FC<DashboardProps> = ({ lessonsCount, usersCount, chartData }) => {
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Activity Chart - Spans 2 Columns */}
                    <div className="col-span-1 md:col-span-2 h-auto">
                        <MiniChart data={chartData} title="Weekly Activity" description="Lessons Completed" unit="lessons" />
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
            </DashboardLayout>
        </>
    );
};

export default DashboardOverviewPage;