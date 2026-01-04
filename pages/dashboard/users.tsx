import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import DashboardLayout from '../../components/DashboardLayout';
import { Search, Shield, ShieldOff, Star, BookOpen, RefreshCw } from 'lucide-react';

interface User {
    user_id: string;
    username: string | null;
    total_stars: number;
    lessons_completed: number;
    is_admin: boolean;
    last_activity_date: string | null;
    updated_at: string;
}

const ManageUsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [updatingUser, setUpdatingUser] = useState<string | null>(null);
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
            const params = debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : '';
            const res = await fetch(`/api/users${params}`);
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to fetch users');
            }
            const data = await res.json();
            setUsers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const toggleAdmin = async (userId: string, currentStatus: boolean) => {
        setUpdatingUser(userId);
        setError(null);
        try {
            const res = await fetch('/api/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, is_admin: !currentStatus }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update user');
            }

            // Update local state
            setUsers(prev => prev.map(u =>
                u.user_id === userId ? { ...u, is_admin: !currentStatus } : u
            ));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUpdatingUser(null);
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

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg">
                            {error}
                        </div>
                    )}

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
                                            <Star className="w-4 h-4 inline" />
                                        </th>
                                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">
                                            <BookOpen className="w-4 h-4 inline" />
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Last Active</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Role</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
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
                                                {user.total_stars}
                                            </td>
                                            <td className="py-4 px-4 text-center text-gray-300">
                                                {user.lessons_completed}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-gray-400">
                                                {formatDate(user.last_activity_date)}
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                {user.is_admin ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-full">
                                                        <Shield className="w-3 h-3" /> Admin
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">
                                                        User
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <button
                                                    onClick={() => toggleAdmin(user.user_id, user.is_admin)}
                                                    disabled={updatingUser === user.user_id}
                                                    className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${user.is_admin
                                                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                                            : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'
                                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                >
                                                    {updatingUser === user.user_id ? (
                                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                                    ) : user.is_admin ? (
                                                        <>
                                                            <ShieldOff className="w-4 h-4" />
                                                            Remove Admin
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Shield className="w-4 h-4" />
                                                            Make Admin
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Stats Footer */}
                    {!isLoading && users.length > 0 && (
                        <div className="text-sm text-gray-500 pt-4 border-t border-white/10">
                            Showing {users.length} user{users.length !== 1 ? 's' : ''}
                            {debouncedSearch && ` matching "${debouncedSearch}"`}
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
};

export default ManageUsersPage;
