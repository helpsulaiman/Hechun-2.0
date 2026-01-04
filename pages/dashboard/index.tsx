// pages/dashboard/index.tsx
import React from 'react';
import Head from 'next/head';
import DashboardLayout from '../../components/DashboardLayout';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { GetServerSidePropsContext } from 'next';

interface DashboardProps {
    idiomsCount: number;
    suggestionsCount: number;
    lessonsCount: number;
    usersCount: number;
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
    const supabase = createServerSupabaseClient(ctx);
    const { data: idioms } = await supabase.from('idioms').select('id', { count: 'exact' });
    const { data: suggestions } = await supabase.from('suggestions').select('id', { count: 'exact' });
    const { count: lessonsCount } = await supabase.from('learning_lessons').select('*', { count: 'exact', head: true });
    // Assuming 'user_stats' has one entry per user, it's a good proxy for user count
    const { count: usersCount } = await supabase.from('user_stats').select('*', { count: 'exact', head: true });


    return {
        props: {
            idiomsCount: idioms?.length || 0,
            suggestionsCount: suggestions?.length || 0,
            lessonsCount: lessonsCount || 0,
            usersCount: usersCount || 0,
        },
    };
};

const DashboardOverviewPage: React.FC<DashboardProps> = ({ idiomsCount, suggestionsCount, lessonsCount, usersCount }) => {
    return (
        <>
            <Head>
                <title>Dashboard</title>
            </Head>
            <DashboardLayout>
                <h1 className="text-3xl font-bold mb-6 text-foreground">Overview</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="glass-effect p-8 rounded-2xl border border-white/10 hover:bg-white/5 transition-all">
                        <h2 className="text-xl font-semibold text-gray-400">Approved Idioms</h2>
                        <p className="text-5xl font-bold mt-4 text-white">{idiomsCount}</p>
                    </div>
                    <div className="glass-effect p-8 rounded-2xl border border-white/10 hover:bg-white/5 transition-all">
                        <h2 className="text-xl font-semibold text-gray-400">Pending Suggestions</h2>
                        <p className="text-5xl font-bold mt-4 text-white">{suggestionsCount}</p>
                    </div>
                    <div className="glass-effect p-8 rounded-2xl border border-white/10 hover:bg-white/5 transition-all">
                        <h2 className="text-xl font-semibold text-gray-400">Total Lessons</h2>
                        <p className="text-5xl font-bold mt-4 text-white">{lessonsCount}</p>
                    </div>
                    <div className="glass-effect p-8 rounded-2xl border border-white/10 hover:bg-white/5 transition-all">
                        <h2 className="text-xl font-semibold text-gray-400">Registered Users</h2>
                        <p className="text-5xl font-bold mt-4 text-white">{usersCount}</p>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};

export default DashboardOverviewPage;