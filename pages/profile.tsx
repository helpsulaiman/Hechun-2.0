import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useConvexAuth, useQuery, useMutation } from 'convex/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { api } from '../convex/_generated/api';
import Layout from '../components/Layout';
import * as Dialog from '@radix-ui/react-dialog';
import SkillRadar from '../components/SkillRadar';

const ProfilePage: React.FC = () => {
    const { user, logout, isAuthenticated, isLoading } = useAuth0();
    const router = useRouter();

    // Convex queries and mutations
    const userProfile = useQuery(api.users.getUser,
        isAuthenticated && user ? { user_id: user.sub! } : "skip"
    );

    // Convex Mutations
    const updateProfileMutation = useMutation(api.users.updateProfile);
    const resetProgressMutation = useMutation(api.users.resetProgress);
    const generateUploadUrl = useMutation(api.users.generateAvatarUploadUrl);
    const getStorageUrl = useMutation(api.users.getStorageUrl);
    const deleteAccountMutation = useMutation(api.users.deleteAccount);

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

    // Change Password State
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [changePasswordMessage, setChangePasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Delete Account State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState(''); // Password or "DELETE"
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    // Reset Progress State
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [resetting, setResetting] = useState(false);

    // Progress State
    const [stats, setStats] = useState({ totalXP: 0, lessonsCompleted: 0 });
    const [skills, setSkills] = useState<any>({ reading_writing: 0, grammar: 0, speaking: 0, vocabulary: 0 });

    // Derived values to ensure live updates from Convex
    const currentStats = (isAuthenticated && userProfile) ? {
        totalXP: userProfile.total_xp || 0,
        lessonsCompleted: userProfile.lessons_completed || 0
    } : stats;

    const currentSkills = (isAuthenticated && userProfile) ?
        (userProfile.skill_vector || { reading_writing: 0, grammar: 0, speaking: 0, vocabulary: 0 })
        : skills;

    // Check if user is OAuth vs email/password
    const isOAuthUser = user?.sub?.startsWith('google-oauth2') || user?.sub?.startsWith('auth0');

    useEffect(() => {
        if (isAuthenticated && user) {
            loadProfile();
        } else if (!isLoading && !isAuthenticated) {
            loadGuestProgress();
        }
    }, [user, isAuthenticated, isLoading]);

    // Debug auth state
    useEffect(() => {
        console.log('Profile Auth State:', { isAuthenticated, isLoading, hasUser: !!user, userSub: user?.sub });
    }, [isAuthenticated, isLoading, user]);

    // Real-time username validation with debouncing
    const [debouncedUsername, setDebouncedUsername] = useState(username);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedUsername(username);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [username]);

    // Query username availability (only when username has changed)
    const usernameCheckResult = useQuery(
        api.users.checkUsername,
        username && username !== originalUsername && username.length >= 3 && debouncedUsername === username
            ? { username: debouncedUsername, currentUserId: user?.sub }
            : "skip"
    );

    // Update validation state based on query result
    useEffect(() => {
        if (!username || username === originalUsername || username.length < 3) {
            setUsernameMessage('');
            setIsUsernameValid(null);
            setIsCheckingUsername(false);
            return;
        }

        if (debouncedUsername !== username) {
            setIsCheckingUsername(true);
            return;
        }

        if (usernameCheckResult !== undefined) {
            setIsUsernameValid(usernameCheckResult.available);
            setUsernameMessage(usernameCheckResult.message);
            setIsCheckingUsername(false);
        }
    }, [username, originalUsername, debouncedUsername, usernameCheckResult]);

    const loadProfile = async () => {
        if (!user) return;
        try {
            // Load from Convex or use Auth0 defaults
            if (userProfile) {
                setUsername(userProfile.username || user.name || '');
                setOriginalUsername(userProfile.username || '');
                setAvatarUrl(userProfile.avatar_url || user.picture || null);
                setStats({
                    totalXP: userProfile.total_xp || 0,
                    lessonsCompleted: userProfile.lessons_completed || 0
                });
                setSkills(userProfile.skill_vector || { reading_writing: 0, grammar: 0, speaking: 0, vocabulary: 0 });
            } else {
                // Fallback to Auth0 user data while loading
                const initialName = user.name || user.email?.split('@')[0] || '';
                setUsername(initialName);
                setOriginalUsername(initialName);
                setAvatarUrl(user.picture || null);
                setStats({ totalXP: 0, lessonsCompleted: 0 });
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

            // Load Guest Skills
            const skillsKey = 'hechun_guest_skills';
            const localSkills = JSON.parse(localStorage.getItem(skillsKey) || '{}');
            if (Object.keys(localSkills).length > 0) {
                setSkills(localSkills);
            }
        } catch (e) {
            console.error("Error loading guest progress", e);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setMessage({ type: 'error', text: 'Please upload a JPEG, JPG, PNG, or WebP image' });
            return;
        }

        // Validate file size (8MB limit)
        if (file.size > 8 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Image must be smaller than 8MB' });
            return;
        }

        setUploading(true);
        setMessage({ type: 'success', text: 'Please wait while your picture is being uploaded...' });

        try {
            // Get upload URL from Convex
            const uploadUrl = await generateUploadUrl();

            // Upload file to Convex storage
            const result = await fetch(uploadUrl, {
                method: 'POST',
                headers: { 'Content-Type': file.type },
                body: file,
            });

            const { storageId } = await result.json();

            // Get the proper URL from Convex storage
            const imageUrl = await getStorageUrl({ storageId });

            if (!imageUrl) {
                throw new Error('Failed to get image URL from storage');
            }

            // Update avatar URL in state (will be saved when user clicks Save)
            setAvatarUrl(imageUrl);
            setMessage({ type: 'success', text: 'Avatar uploaded! Click "Save Changes" to apply.' });
        } catch (error: any) {
            console.error('Avatar upload error:', error);
            setMessage({
                type: 'error',
                text: error.message || 'Failed to upload avatar. Please try again.'
            });
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated || !user) {
            setMessage({ type: 'error', text: 'You must be logged in to update your profile.' });
            return;
        }

        // Validate username
        if (!username || username.trim().length < 3) {
            setMessage({ type: 'error', text: 'Username must be at least 3 characters long.' });
            return;
        }

        if (username.trim().length > 30) {
            setMessage({ type: 'error', text: 'Username must be less than 30 characters.' });
            return;
        }

        // If username changed and validation failed, don't submit
        if (username !== originalUsername && isUsernameValid === false) {
            setMessage({ type: 'error', text: usernameMessage || 'Please choose a different username.' });
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            console.log('Updating profile:', { userId: user.sub, username, avatar_url: avatarUrl });

            await updateProfileMutation({
                userId: user.sub!,
                username: username.trim(),
                avatar_url: avatarUrl || undefined,
            });

            setMessage({ type: 'success', text: 'Profile updated successfully!' });

            // Update local state immediately so input reflects saved values
            const trimmedUsername = username.trim();
            setUsername(trimmedUsername);
            setOriginalUsername(trimmedUsername);
            setIsUsernameValid(null);
            setUsernameMessage('');
        } catch (error: any) {
            console.error('Profile update error:', error);
            setMessage({
                type: 'error',
                text: error.message || 'Failed to update profile. Please try again.'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement with Auth0 - redirect to Auth0 password change
        setChangePasswordMessage({ type: 'error', text: 'Use Auth0 to change your password' });
        return;
    };

    const handleLogout = () => {
        logout({
            logoutParams: {
                returnTo: window.location.origin
            }
        });
    };

    const handleResetProgress = async () => {
        setResetting(true);
        try {
            if (isAuthenticated && user) {
                // Call Convex mutation to reset progress
                await resetProgressMutation({ userId: user.sub! });
            }

            // Always clear local storage (for guests or backup)
            localStorage.removeItem('hechun_guest_skills');
            localStorage.removeItem('hechun_guest_progress_counts');
            localStorage.removeItem('hechun_guest_skills_selection');

            window.location.href = '/onboarding/start'; // Redirect to onboarding
        } catch (error) {
            console.error("Reset failed", error);
            alert("Failed to reset progress. Please try again.");
        } finally {
            setResetting(false);
            setIsResetModalOpen(false);
        }
    };

    const handleDeleteAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated || !user) return;

        setIsDeleting(true);
        setDeleteError('');

        try {
            // Delete from Convex
            await deleteAccountMutation({ userId: user.sub! });

            // Clear local storage
            localStorage.clear();

            // Log out from Auth0
            logout({
                logoutParams: {
                    returnTo: window.location.origin
                }
            });
        } catch (error: any) {
            console.error('Delete account error:', error);
            setDeleteError(error.message || 'Failed to delete account. Please try again.');
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
                                            <label htmlFor="username" className="block font-medium mb-2 text-sm text-muted-foreground">
                                                Username
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="username"
                                                    type="text"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    className={`form-input w-full transition-all ${isUsernameValid === false
                                                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500 shadow-red-500/20 shadow-lg'
                                                        : isUsernameValid === true
                                                            ? 'border-green-500 focus:ring-green-500 focus:border-green-500 shadow-green-500/20 shadow-lg'
                                                            : isCheckingUsername
                                                                ? 'border-blue-500 focus:ring-blue-500 focus:border-blue-500'
                                                                : ''
                                                        }`}
                                                    placeholder="Choose a username"
                                                    minLength={3}
                                                />
                                                {isCheckingUsername && (
                                                    <span className="absolute right-3 top-2.5 text-xs text-blue-500 flex items-center gap-1">
                                                        <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Checking...
                                                    </span>
                                                )}
                                                {isUsernameValid === true && !isCheckingUsername && (
                                                    <span className="absolute right-3 top-2.5 text-green-500">
                                                        ✓
                                                    </span>
                                                )}
                                                {isUsernameValid === false && !isCheckingUsername && (
                                                    <span className="absolute right-3 top-2.5 text-red-500">
                                                        ⚠
                                                    </span>
                                                )}
                                            </div>
                                            {usernameMessage && (
                                                <p className={`text-xs mt-2 flex items-center gap-1 ${isUsernameValid
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-red-600 dark:text-red-400'
                                                    }`}>
                                                    {isUsernameValid ? '✓' : '⚠'} {usernameMessage}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                type="submit"
                                                disabled={saving || isUsernameValid === false}
                                                className="btn btn-primary"
                                            >
                                                {saving ? 'Saving...' : 'Save Changes'}
                                            </button>

                                            {!isOAuthUser && (
                                                <Dialog.Root open={isChangePasswordModalOpen} onOpenChange={setIsChangePasswordModalOpen}>
                                                    <Dialog.Trigger asChild>
                                                        <button type="button" className="btn btn-secondary">
                                                            Change Password
                                                        </button>
                                                    </Dialog.Trigger>
                                                    <Dialog.Portal>
                                                        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 fade-in" />
                                                        <Dialog.Content className="fixed top-1/2 left-1/2 max-w-md w-full -translate-x-1/2 -translate-y-1/2 bg-[var(--bg-card)] p-6 rounded-lg shadow-xl z-50 border border-[var(--border-color)] slide-up-content">
                                                            <Dialog.Title className="text-xl font-bold mb-4 text-[var(--text-primary)]">Change Password</Dialog.Title>

                                                            {changePasswordMessage && (
                                                                <div className={`p-3 mb-4 rounded ${changePasswordMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                    {changePasswordMessage.text}
                                                                </div>
                                                            )}

                                                            <form onSubmit={handleChangePassword} className="space-y-4">
                                                                <div>
                                                                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">New Password</label>
                                                                    <input
                                                                        type="password"
                                                                        className="form-input w-full"
                                                                        value={newPassword}
                                                                        onChange={e => setNewPassword(e.target.value)}
                                                                        required
                                                                        minLength={6}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Confirm New Password</label>
                                                                    <input
                                                                        type="password"
                                                                        className="form-input w-full"
                                                                        value={confirmNewPassword}
                                                                        onChange={e => setConfirmNewPassword(e.target.value)}
                                                                        required
                                                                        minLength={6}
                                                                    />
                                                                </div>
                                                                <div className="flex justify-end gap-3 mt-6">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setIsChangePasswordModalOpen(false)}
                                                                        className="btn btn-secondary"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        type="submit"
                                                                        disabled={isChangingPassword}
                                                                        className="btn btn-primary"
                                                                    >
                                                                        {isChangingPassword ? 'Updating...' : 'Update Password'}
                                                                    </button>
                                                                </div>
                                                            </form>
                                                        </Dialog.Content>
                                                    </Dialog.Portal>
                                                </Dialog.Root>
                                            )}
                                        </div>
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
                                    <span className="block text-4xl font-bold text-[var(--color-primary)] mb-1">{currentStats.totalXP}</span>
                                    <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Total XP</span>
                                </div>
                                <div className="dashboard-card items-center text-center py-6 px-4">
                                    <span className="block text-4xl font-bold text-purple-600 mb-1">{currentStats.lessonsCompleted}</span>
                                    <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Lessons</span>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Skill List */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 text-[var(--text-secondary)]">Skill Breakdown</h3>
                            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl divide-y divide-[var(--border-color)]">
                                {['reading_writing', 'speaking', 'grammar', 'vocabulary'].map((key) => {
                                    const skillLabels: Record<string, string> = {
                                        reading_writing: 'Reading & Writing',
                                        speaking: 'Speaking',
                                        grammar: 'Grammar',
                                        vocabulary: 'Vocabulary'
                                    };
                                    const skillColors: Record<string, string> = {
                                        reading_writing: 'bg-indigo-500',
                                        speaking: 'bg-green-500',
                                        grammar: 'bg-yellow-500',
                                        vocabulary: 'bg-red-500'
                                    };
                                    const value = currentSkills[key] || 0;
                                    return (
                                        <div key={key} className="flex items-center justify-between p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-8 rounded-full ${skillColors[key]}`}></div>
                                                <span className="capitalize font-medium text-[var(--text-primary)]">{skillLabels[key]}</span>
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
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    <section className="bg-white/5 border border-[var(--border-color)] rounded-3xl p-8 flex flex-col items-center justify-center min-h-[400px]">
                        <h2 className="text-2xl font-bold mb-4 text-[var(--text-primary)] text-center">Skill Profile</h2>
                        <SkillRadar
                            skills={currentSkills}
                            size={350}
                            max={100}
                        />
                        <div className="mt-2 text-center text-sm text-[var(--text-secondary)] max-w-xs mx-auto">
                            Your personalized skill vector based on recent lesson performance.
                        </div>
                    </section>
                </div>

                {/* Cookie Settings */}
                {user && (
                    <section>
                        <h2 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">Cookie Settings</h2>
                        <div className="dashboard-card">
                            <p className="text-sm text-[var(--text-secondary)] mb-4">
                                Manage your cookie preferences. Some cookies are necessary for the site to function.
                            </p>
                            <div className="space-y-3">
                                {(() => {
                                    const savedConsent = localStorage.getItem('hechun_cookie_consent');
                                    const consent = savedConsent ? JSON.parse(savedConsent) : {
                                        necessary: true,
                                        analytics: false,
                                        functional: false
                                    };

                                    return (
                                        <>
                                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <div>
                                                    <h4 className="font-semibold text-sm">Necessary Cookies</h4>
                                                    <p className="text-xs text-[var(--text-secondary)]">Required for site functionality</p>
                                                </div>
                                                <input type="checkbox" checked={true} disabled className="w-4 h-4" />
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <div>
                                                    <h4 className="font-semibold text-sm">Analytics Cookies</h4>
                                                    <p className="text-xs text-[var(--text-secondary)]">Help us improve lessons</p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={consent.analytics}
                                                    onChange={(e) => {
                                                        const newConsent = { ...consent, analytics: e.target.checked };
                                                        localStorage.setItem('hechun_cookie_consent', JSON.stringify(newConsent));
                                                        window.location.reload();
                                                    }}
                                                    className="w-4 h-4 accent-indigo-600"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <div>
                                                    <h4 className="font-semibold text-sm">Functional Cookies</h4>
                                                    <p className="text-xs text-[var(--text-secondary)]">Remember your preferences</p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={consent.functional}
                                                    onChange={(e) => {
                                                        const newConsent = { ...consent, functional: e.target.checked };
                                                        localStorage.setItem('hechun_cookie_consent', JSON.stringify(newConsent));
                                                        window.location.reload();
                                                    }}
                                                    className="w-4 h-4 accent-indigo-600"
                                                />
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </section>
                )}

                {/* Danger Zone */}
                <section className="pt-8 border-t border-[var(--border-color)]">
                    <h2 className="text-2xl font-bold mb-6 text-red-600">DANGER ZONE</h2>

                    <div className="space-y-6">
                        {/* Reset Progress */}
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-6 flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-red-900 dark:text-red-200">Reset Progress</h3>
                                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                    Clear all your lesson history and XP. Your account remains active.
                                </p>
                            </div>
                            <Dialog.Root open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
                                <Dialog.Trigger asChild>
                                    <button className="btn btn-warning text-white hover:bg-orange-600 bg-orange-500 border-none">Reset Progress</button>
                                </Dialog.Trigger>
                                <Dialog.Portal>
                                    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 fade-in" />
                                    <Dialog.Content className="fixed top-1/2 left-1/2 max-w-md w-full -translate-x-1/2 -translate-y-1/2 bg-[var(--bg-card)] p-6 rounded-lg shadow-xl z-50 border border-[var(--border-color)] slide-up-content">
                                        <Dialog.Title className="text-xl font-bold mb-4 text-[var(--text-primary)]">Confirm Reset</Dialog.Title>
                                        <Dialog.Description className="text-[var(--text-secondary)] mb-6">
                                            Are you sure you want to reset your progress? This will delete all lesson history and XP.
                                            <br /><br />
                                            <strong className="text-red-500">This action cannot be undone.</strong>
                                        </Dialog.Description>

                                        <div className="flex justify-end gap-3 mt-6">
                                            <button
                                                type="button"
                                                onClick={() => setIsResetModalOpen(false)}
                                                className="btn btn-secondary"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleResetProgress}
                                                className="btn btn-danger text-white"
                                                disabled={resetting}
                                            >
                                                {resetting ? 'Resetting...' : 'Yes, Reset Everything'}
                                            </button>
                                        </div>
                                    </Dialog.Content>
                                </Dialog.Portal>
                            </Dialog.Root>
                        </div>

                        {/* Delete Account */}
                        {user && (
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
                                                {isOAuthUser ? (
                                                    <span>
                                                        To confirm deletion, please type <strong className="text-red-500">DELETE</strong> below.
                                                    </span>
                                                ) : (
                                                    <span>Please enter your password to confirm you want to permanently delete your account.</span>
                                                )}
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
                                                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
                                                        {isOAuthUser ? 'Confirmation' : 'Password'}
                                                    </label>
                                                    <input
                                                        type={isOAuthUser ? 'text' : 'password'}
                                                        className="search-input w-full"
                                                        placeholder={isOAuthUser ? 'Type DELETE' : 'Enter your password'}
                                                        value={deleteConfirmation}
                                                        onChange={e => setDeleteConfirmation(e.target.value)}
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
                        )}
                    </div>
                </section>

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
