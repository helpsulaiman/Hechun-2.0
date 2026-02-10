import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import DashboardLayout from '../../components/DashboardLayout';
import { Search, Star, BookOpen, RefreshCw, Flame } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

// Define a type that matches what we get from Convex + what UI expects
interface DashboardUser {
    _id: string;
    user_id: string;
    username?: string;
    email?: string;
    avatar_url?: string;
    total_xp: number;
    lessons_completed: number;
    streak_days: number;
    last_active_date?: string;
    is_admin?: boolean;
}

const ManageUsersPage: React.FC = () => {
    const [users, setUsers] = useState<DashboardUser[]>([]);
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

    const allUsers = useQuery(api.users.getAllUsers) || [];
    const updateUser = useMutation(api.users.upsertUser);

    useEffect(() => {
        // Client-side search filtering
        if (allUsers) {
            const mappedUsers: DashboardUser[] = allUsers.map((u: any) => ({
                _id: u._id,
                user_id: u.user_id,
                username: u.username,
                email: u.email,
                avatar_url: u.avatar_url,
                total_xp: u.total_xp || 0,
                lessons_completed: u.lessons_completed || 0,
                streak_days: u.streak_days || 0,
                last_active_date: u.last_active_date,
                is_admin: u.is_admin
            }));

            const filtered = mappedUsers.filter((u) =>
                u.username?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                u.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                u.user_id?.includes(debouncedSearch)
            );
            setUsers(filtered);
            setIsLoading(false);
        }
    }, [debouncedSearch, allUsers]);

    const toggleAdmin = async (userId: string, currentStatus: boolean) => {
        try {
            await updateUser({
                user_id: userId,
                // We need to add is_admin to schema/upsert if it's not there, 
                // but for now let's assume we can patch it or use a specific admin mutation if needed.
                // Actually upsertUser schema in users.ts doesn't expose is_admin update for security.
                // We should strictly creating a separate toggleAdmin mutation in backend if we want this feature.
                // For now, I'll comment out the actual call or use a placeholder if the backend isn't ready.
                // await updateUser({ user_id: userId, is_admin: !currentStatus }); 
                // Since upsertUser in users.ts DOES NOT allow is_admin, we can't do this yet without backend change.
                // I will alert the user about this limitation or add the mutation.
            });
            alert("Admin toggling requires a specific backend mutation. Please add 'toggleAdmin' to convex/users.ts");
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
                            // No manual refresh needed with Convex live queries
                            className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-muted border border-border rounded-lg text-sm text-foreground transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4`} />
                            Live Info
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    {/* Users Table */}
                    {isLoading ? (
                        <div className="text-center py-12 text-muted-foreground">Loading users...</div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12 bg-card rounded-lg border border-border">
                            <p className="text-muted-foreground">
                                {debouncedSearch ? 'No users found matching your search.' : 'No users found.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-card rounded-lg border border-border">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                                            XP
                                        </th>
                                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                                            <BookOpen className="w-4 h-4 inline" />
                                        </th>
                                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                                            <Flame className="w-4 h-4 inline" />
                                        </th>
                                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Admin</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Active</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {users.map((user) => (
                                        <tr key={user.user_id} className="hover:bg-muted/50 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                        {(user.username || 'U')[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">
                                                            {user.username || 'Unnamed User'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground font-mono">
                                                            {user.user_id.slice(0, 8)}...
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center text-yellow-500 font-medium">
                                                {user.total_xp}
                                            </td>
                                            <td className="py-4 px-4 text-center text-foreground">
                                                {user.lessons_completed}
                                            </td>
                                            <td className="py-4 px-4 text-center text-orange-500 font-bold">
                                                {user.streak_days}
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <button
                                                    onClick={() => toggleAdmin(user.user_id, !!user.is_admin)}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${user.is_admin
                                                        ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                        }`}
                                                >
                                                    {user.is_admin ? 'Admin' : 'User'}
                                                </button>
                                            </td>
                                            <td className="py-4 px-4 text-sm text-muted-foreground">
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
