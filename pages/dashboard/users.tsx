import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import DashboardLayout from '../../components/DashboardLayout';
import { Search, Star, BookOpen, RefreshCw, Flame } from 'lucide-react';
import { UserProfile } from '../../types/learning';

const ManageUsersPage: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Note: In a real app, you'd have an API route to fetch this securely
            // For now we might need to mock or enable RLS policies to allow this
            const res = await fetch(`/api/users?search=${encodeURIComponent(debouncedSearch)}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                // Fallback if API not ready
                setUsers([]);
            }
        } catch (err: any) {
            console.error(err);
            // setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const toggleAdmin = async (userId: string, currentStatus: boolean) => {
        try {
            const res = await fetch('/api/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, is_admin: !currentStatus })
            });

            if (res.ok) {
                // Optimistic update
                setUsers(users.map(u =>
                    u.user_id === userId ? { ...u, is_admin: !currentStatus } : u
                ));
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to update admin status');
            }
        } catch (e) {
            console.error(e);
            alert('Failed to update admin status');
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <>
            <Head>
                <title>Manage Users - Dashboard</title>
            </Head>
            <DashboardLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h1 className="text-3xl font-bold text-foreground">Manage Users</h1>
                        <button
                            onClick={fetchUsers}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    {/* Users Table */}
                    {isLoading ? (
                        <div className="text-center py-12 text-muted-foreground">Loading users...</div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-muted-foreground">
                                {debouncedSearch ? 'No users found matching your search.' : 'No users found.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">User</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">
                                            XP
                                        </th>
                                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">
                                            <BookOpen className="w-4 h-4 inline" />
                                        </th>
                                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">
                                            <Flame className="w-4 h-4 inline" />
                                        </th>
                                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Admin</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Last Active</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map((user) => (
                                        <tr key={user.user_id} className="hover:bg-white/5 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                        {(user.username || 'U')[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">
                                                            {user.username || 'Unnamed User'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 font-mono">
                                                            {user.user_id.slice(0, 8)}...
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center text-yellow-400 font-medium">
                                                {user.total_xp}
                                            </td>
                                            <td className="py-4 px-4 text-center text-gray-300">
                                                {user.lessons_completed}
                                            </td>
                                            <td className="py-4 px-4 text-center text-orange-500 font-bold">
                                                {user.streak_days}
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <button
                                                    onClick={() => toggleAdmin(user.user_id, !!user.is_admin)}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${user.is_admin
                                                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                            : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                                                        }`}
                                                >
                                                    {user.is_admin ? 'Admin' : 'User'}
                                                </button>
                                            </td>
                                            <td className="py-4 px-4 text-sm text-gray-400">
                                                {formatDate(user.last_active_date)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
};

export default ManageUsersPage;
