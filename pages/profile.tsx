import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useUser, useSupabaseClient, useSessionContext } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { fetchUserBadges, fetchUserStats, updateUserProfile } from '../lib/learning-api';
import Layout from '../components/Layout';
import * as Dialog from '@radix-ui/react-dialog';

const ProfilePage: React.FC = () => {
    const { isLoading } = useSessionContext();
    const user = useUser();
    const supabase = useSupabaseClient();
    const router = useRouter();

    // Profile State
    const [username, setUsername] = useState('');
    const [originalUsername, setOriginalUsername] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Username Check State
    const [isUsernameValid, setIsUsernameValid] = useState<boolean | null>(null);
    const [usernameMessage, setUsernameMessage] = useState('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);

    // Delete Account State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    // Progress State
    const [stats, setStats] = useState({ totalStars: 0, lessonsCompleted: 0 });
    const [badges, setBadges] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            loadProfile();
            loadProgress();
        } else if (!isLoading) {
            loadGuestProgress();
        }
    }, [user, isLoading]);

    // Debounce username check
    useEffect(() => {
        const checkUsername = async () => {
            if (!username || username === originalUsername || username.length < 3) {
                setIsUsernameValid(null);
                setUsernameMessage('');
                return;
            }

            setIsCheckingUsername(true);
            try {
                const res = await fetch('/api/check-username', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username }),
                });
                const data = await res.json();

                setIsUsernameValid(data.valid);
                setUsernameMessage(data.message);
            } catch (error) {
                console.error('Error checking username', error);
            } finally {
                setIsCheckingUsername(false);
            }
        };

        const timer = setTimeout(checkUsername, 500);
        return () => clearTimeout(timer);
    }, [username, originalUsername]);

    const loadProfile = async () => {
        if (!user) return;
        try {
            const userStats = await fetchUserStats(supabase, user.id);
            const initialName = userStats?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || '';
            setUsername(initialName);
            setOriginalUsername(initialName);
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const loadProgress = async () => {
        if (!user) return;
        try {
            const [userBadges, userStats] = await Promise.all([
                fetchUserBadges(supabase, user.id),
                fetchUserStats(supabase, user.id)
            ]);

            setBadges(userBadges || []);
            if (userStats) {
                setStats({
                    totalStars: userStats.total_stars,
                    lessonsCompleted: userStats.lessons_completed
                });
            }
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    };

    const loadGuestProgress = () => {
        try {
            const localProgress = JSON.parse(localStorage.getItem('hechun_guest_progress') || '{}');
            const totalStars = Object.values(localProgress).reduce((sum: number, s: any) => sum + (Number(s) || 0), 0);
            const lessonsCompleted = Object.keys(localProgress).length;
            setStats({ totalStars, lessonsCompleted });
            setBadges([]);
        } catch (e) {
            console.error("Error loading guest progress", e);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // Prevent update if username is invalid (and different from original)
        if (username !== originalUsername && isUsernameValid === false) {
            return;
        }

        setSaving(true);
        setMessage(null);
        try {
            await updateUserProfile(supabase, user.id, username);
            setOriginalUsername(username); // Update original so we don't re-check validity unnecessarily
            setMessage({ type: 'success', text: 'Profile updated!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update' });
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const handleDeleteAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.email) return;

        setIsDeleting(true);
        setDeleteError('');

        try {
            // 1. Re-authenticate with password to verify ownership
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: deletePassword
            });

            if (authError) {
                throw new Error('Incorrect password. Please try again.');
            }

            // 2. Call API to delete account
            const res = await fetch('/api/delete-account', {
                method: 'POST',
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to delete account');
            }

            // 3. Sign out and redirect
            await supabase.auth.signOut();
            router.push('/');

        } catch (error: any) {
            setDeleteError(error.message);
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return <div className="p-10 text-center">Loading...</div>;
    }

    return (
        <Layout title="Your Profile">
            <div className="container mt-12 space-y-12">

                {/* Header Section */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-[var(--border-color)] pb-6">
                    <div></div> {/* Spacer for centering */}
                    <h1 className="page-title !m-0 !p-0 text-center">Dashboard</h1>
                    <div className="flex justify-end">
                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="btn btn-secondary btn-sm"
                            >
                                Sign Out
                            </button>
                        ) : (
                            <Link href="/auth/login" className="btn btn-primary">
                                Log In
                            </Link>
                        )}
                    </div>
                </div>

                {/* Profile Settings */}
                <section>
                    <h2 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">Profile Settings</h2>
                    {user ? (
                        <div className="form-container !m-0 !max-w-none">
                            {message && (
                                <div className={`p-3 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {message.text}
                                </div>
                            )}
                            <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-md">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">Display Name</label>
                                    <div className="relative">
                                        <input
                                            id="username"
                                            type="text"
                                            value={username}
                                            onChange={e => setUsername(e.target.value)}
                                            className={`form-input w-full ${isUsernameValid === true ? 'border-green-500 focus:border-green-500' :
                                                isUsernameValid === false ? 'border-red-500 focus:border-red-500' : ''
                                                }`}
                                            placeholder="Enter username"
                                            minLength={3}
                                        />
                                        {isCheckingUsername && (
                                            <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">Checking...</span>
                                        )}
                                    </div>
                                    {usernameMessage && (
                                        <p className={`text-xs mt-1 ${isUsernameValid ? 'text-green-500' : 'text-red-500'}`}>
                                            {usernameMessage}
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={saving || isUsernameValid === false}
                                    className="btn btn-primary"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="dashboard-card text-center py-8">
                            <p className="text-[var(--text-secondary)]">Log in to edit your profile.</p>
                        </div>
                    )}
                </section>

                {/* Statistics */}
                <section>
                    <h2 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">Your Progress</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="dashboard-card items-center text-center py-8">
                            <span className="block text-5xl font-bold text-[var(--color-primary)] mb-2">{stats.totalStars}</span>
                            <span className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">Total Stars</span>
                        </div>
                        <div className="dashboard-card items-center text-center py-8">
                            <span className="block text-5xl font-bold text-purple-600 mb-2">{stats.lessonsCompleted}</span>
                            <span className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">Lessons Completed</span>
                        </div>
                    </div>
                </section>

                {/* Badges */}
                <section>
                    <h2 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">Badges</h2>
                    {badges.length === 0 ? (
                        <div className="dashboard-card text-center py-10">
                            <p className="text-[var(--text-secondary)] italic">No badges earned yet. Complete lessons to earn them!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {badges.map((b: any) => (
                                <div key={b.id} className="idiom-card flex flex-col items-center text-center">
                                    <img
                                        src={b.badge.icon_url || '/placeholder.png'}
                                        alt={b.badge.name}
                                        className="w-20 h-20 mb-4 object-contain"
                                    />
                                    <span className="font-semibold text-[var(--text-primary)]">{b.badge.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Danger Zone */}
                {user && (
                    <section className="pt-8 border-t border-[var(--border-color)]">
                        <h2 className="text-2xl font-bold mb-6 text-red-600">Danger Zone</h2>
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-6 flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-red-900 dark:text-red-200">Delete Account</h3>
                                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                    Permanently remove your account and all of your content. This action is not reversible.
                                </p>
                            </div>
                            <Dialog.Root open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                                <Dialog.Trigger asChild>
                                    <button className="btn btn-danger text-white hover:bg-red-700">Delete Account</button>
                                </Dialog.Trigger>
                                <Dialog.Portal>
                                    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 fade-in" />
                                    <Dialog.Content className="fixed top-1/2 left-1/2 max-w-md w-full -translate-x-1/2 -translate-y-1/2 bg-[var(--bg-card)] p-6 rounded-lg shadow-xl z-50 border border-[var(--border-color)] slide-up-content">
                                        <Dialog.Title className="text-xl font-bold mb-4 text-[var(--text-primary)]">Confirm Account Deletion</Dialog.Title>
                                        <Dialog.Description className="text-[var(--text-secondary)] mb-6">
                                            Please enter your password to confirm you want to permanently delete your account.
                                            <br /><br />
                                            <strong className="text-red-500">Warning: This cannot be undone.</strong>
                                        </Dialog.Description>

                                        <form onSubmit={handleDeleteAccount} className="space-y-4">
                                            {deleteError && (
                                                <div className="bg-red-100 text-red-600 p-3 rounded text-sm">
                                                    {deleteError}
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Password</label>
                                                <input
                                                    type="password"
                                                    className="search-input w-full"
                                                    placeholder="Enter your password"
                                                    value={deletePassword}
                                                    onChange={e => setDeletePassword(e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="flex justify-end gap-3 mt-6">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsDeleteModalOpen(false)}
                                                    className="btn btn-secondary"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="btn btn-danger text-white"
                                                    disabled={isDeleting}
                                                >
                                                    {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                                                </button>
                                            </div>
                                        </form>
                                    </Dialog.Content>
                                </Dialog.Portal>
                            </Dialog.Root>
                        </div>
                    </section>
                )}

                <div className="pt-8 border-t border-[var(--border-color)]">
                    <Link href="/" className="btn btn-secondary btn-sm">
                        &larr; Back to Home
                    </Link>
                </div>
            </div>
        </Layout>
    );
};

export default ProfilePage;
