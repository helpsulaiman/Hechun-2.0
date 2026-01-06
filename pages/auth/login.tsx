import React, { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import radixStyles from '../../styles/RadixTabs.module.css';
import { Google } from '../../components/icons/Google';
import { getURL } from '../../lib/getURL';

const HechunLoginPage: React.FC = () => {
    const supabase = useSupabaseClient();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Migrate guest progress if exists
            try {
                // 1. Ensure User Profile exists (Trigger might be slow or relying on API access)
                await fetch('/api/user');

                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    // Dynamic import to avoid SSR issues if any, or just direct
                    const { migrateGuestProgress } = await import('../../lib/learning-api');
                    await migrateGuestProgress(supabase, session.user.id);
                }
            } catch (migrationError) {
                console.error("Migration failed", migrationError);
            }

            router.push('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'facebook') => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    // Use robust URL helper
                    redirectTo: getURL(),
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <Layout title="Login - Hečhun">
            <div className="form-container" style={{ maxWidth: '450px' }}>
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                    <p className="text-muted-foreground mb-8">Sign in to continue your learning journey.</p>
                </div>


                <form onSubmit={handleLogin}>
                    <fieldset className={radixStyles.Fieldset}>
                        <label htmlFor="email" className={radixStyles.Label}>
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={radixStyles.Input}
                            required
                        />
                    </fieldset>
                    <fieldset className={radixStyles.Fieldset}>
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="password" className={radixStyles.Label} style={{ marginBottom: 0 }}>
                                Password
                            </label>
                            <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={radixStyles.Input}
                            required
                        />
                    </fieldset>

                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            <span className="text-red-500 mt-0.5">⚠️</span>
                            <p className="text-sm font-medium text-red-600">
                                {error === 'Invalid login credentials'
                                    ? 'Incorrect email or password. Please try again.'
                                    : error}
                            </p>
                        </div>
                    )}

                    <div className="mt-6">
                        <button
                            type="submit"
                            className={`${radixStyles.Button} ${radixStyles.ButtonBlue} w-full`}
                            disabled={loading}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <button
                            onClick={() => handleSocialLogin('google')}
                            className="w-full flex justify-center items-center py-2 px-4 border border-border rounded-md shadow-sm bg-card text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition"
                        >
                            <Google className="w-5 h-5 mr-3" />
                            Google
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center text-gray-600">
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/register" className="text-blue-600 font-bold hover:underline">
                        Register
                    </Link>
                </div>
            </div>
        </Layout>
    );
};

export default HechunLoginPage;
