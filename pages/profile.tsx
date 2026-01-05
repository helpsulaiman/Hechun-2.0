import React, { useState, useEffect } from 'react';
import { useUser, useSupabaseClient, useSessionContext } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { fetchUserProfile, updateUserProfile } from '../lib/learning-api';
import Layout from '../components/Layout';
import * as Dialog from '@radix-ui/react-dialog';
import SkillRadar from '../components/SkillRadar';

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

    // Avatar State
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

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
    const [stats, setStats] = useState({ totalXP: 0, lessonsCompleted: 0 });
    const [skills, setSkills] = useState<any>({ reading: 0, grammar: 0, listening: 0, speaking: 0 });

    useEffect(() => {
        if (user) {
            loadProfile();
        } else if (!isLoading) {
            loadGuestProgress();
        }
    }, [user, isLoading]);

    // ... (Effect for username check omitted)

    const loadProfile = async () => {
        if (!user) return;
        try {
            const profile = await fetchUserProfile(supabase, user.id);
            const initialName = profile?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || '';
            setUsername(initialName);
            setOriginalUsername(initialName);
            setAvatarUrl(profile?.avatar_url || null);

            if (profile) {
                setStats({
                    totalXP: profile.total_xp || 0,
                    lessonsCompleted: profile.lessons_completed || 0
                });
                if (profile.skill_vector && typeof profile.skill_vector === 'object') {
                    setSkills(profile.skill_vector);
                }
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const loadGuestProgress = () => {
        try {
            // Guest progress: Count lessons completed in local storage
            const progressKey = 'hechun_guest_progress_counts';
            const localProgress = JSON.parse(localStorage.getItem(progressKey) || '{}');
            const lessonsCompleted = Object.keys(localProgress).length;
            // Approx XP for guest
            const totalXP = lessonsCompleted * 10;

            setStats({ totalXP, lessonsCompleted });
        } catch (e) {
            console.error("Error loading guest progress", e);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            setMessage(null);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to Supabase
            const { error: uploadError } = await supabase.storage
                .from('profile-images')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get Public URL
            const { data } = supabase.storage
                .from('profile-images')
                .getPublicUrl(filePath);

            const publicUrl = data.publicUrl;

            // Update Profile
            await updateUserProfile(supabase, user!.id, { avatar_url: publicUrl });
            setAvatarUrl(publicUrl);
            setMessage({ type: 'success', text: 'Profile picture updated!' });

        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setUploading(false);
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
            await updateUserProfile(supabase, user.id, { username });
            setOriginalUsername(username);
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
                            <form onSubmit={handleUpdateProfile} className="max-w-xl">
                                <div className="flex flex-col sm:flex-row gap-8 items-start">
                                    {/* Avatar Column */}
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="relative group cursor-pointer w-32 h-32">
                                            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-[var(--border-color)] bg-gray-100 flex items-center justify-center shadow-sm">
                                                {avatarUrl ? (
                                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-4xl font-bold text-gray-400">
                                                        {(username || 'U')[0].toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                                                {uploading ? '...' : 'Change'}
                                            </label>
                                            <input
                                                type="file"
                                                id="avatar-upload"
                                                accept="image/*"
                                                onChange={handleAvatarUpload}
                                                className="hidden"
                                                disabled={uploading}
                                            />
                                        </div>
                                    </div>

                                    {/* Username Column */}
                                    <div className="flex-1 w-full space-y-4 pt-2">
                                        <div>
                                            <label htmlFor="username" className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Display Name</label>
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
                                    </div>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="dashboard-card text-center py-8">
                            <p className="text-[var(--text-secondary)]">Log in to edit your profile.</p>
                        </div>
                    )}
                </section>


                {/* Statistics & Skills */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <section className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">Your Progress</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="dashboard-card items-center text-center py-6 px-4">
                                    <span className="block text-4xl font-bold text-[var(--color-primary)] mb-1">{stats.totalXP}</span>
                                    <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Total XP</span>
                                </div>
                                <div className="dashboard-card items-center text-center py-6 px-4">
                                    <span className="block text-4xl font-bold text-purple-600 mb-1">{stats.lessonsCompleted}</span>
                                    <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Lessons</span>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Skill List */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 text-[var(--text-secondary)]">Skill Breakdown</h3>
                            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl divide-y divide-[var(--border-color)]">
                                {Object.entries(skills).map(([key, value]: [string, any]) => (
                                    <div key={key} className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-8 rounded-full ${key === 'reading' ? 'bg-indigo-500' :
                                                key === 'writing' ? 'bg-purple-500' :
                                                    key === 'speaking' ? 'bg-green-500' : 'bg-blue-500'
                                                }`}></div>
                                            <span className="capitalize font-medium text-[var(--text-primary)]">{key}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500"
                                                    style={{ width: `${Math.min(100, Math.max(5, typeof value === 'number' ? value : 0))}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-mono text-[var(--text-secondary)] w-8 text-right">
                                                {typeof value === 'number' ? value : 0}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="bg-white/5 border border-[var(--border-color)] rounded-3xl p-8 flex flex-col items-center justify-center min-h-[400px]">
                        <h2 className="text-2xl font-bold mb-4 text-[var(--text-primary)] text-center">Skill Profile</h2>
                        <SkillRadar
                            skills={skills}
                            size={350}
                            max={100}
                        />
                        <div className="mt-2 text-center text-sm text-[var(--text-secondary)] max-w-xs mx-auto">
                            Your personalized skill vector based on recent lesson performance.
                        </div>
                    </section>
                </div>

                {/* Danger Zone */}
                {user && (
                    <section className="pt-8 border-t border-[var(--border-color)]">
                        <h2 className="text-2xl font-bold mb-6 text-red-600">DELETE ACCOUNT</h2>
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
