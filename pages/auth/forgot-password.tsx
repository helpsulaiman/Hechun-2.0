import React, { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import radixStyles from '../../styles/RadixTabs.module.css';
import { getURL } from '../../lib/getURL';

const ForgotPasswordPage: React.FC = () => {
    const supabase = useSupabaseClient();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${getURL()}auth/update-password`,
            });

            if (error) throw error;
            setMessage('Check your email for the password reset link.');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout title="Reset Password - Hečhun">
            <div className="form-container" style={{ maxWidth: '450px' }}>
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
                    <p className="text-muted-foreground mb-8">Enter your email to receive a reset link.</p>
                </div>

                <form onSubmit={handleReset}>
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

                    {message && (
                        <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 flex items-start gap-3 animate-in fade-in">
                            <span className="text-green-500 mt-0.5">✅</span>
                            <p className="text-sm font-medium text-green-600">{message}</p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3 animate-in fade-in">
                            <span className="text-red-500 mt-0.5">⚠️</span>
                            <p className="text-sm font-medium text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="mt-6">
                        <button
                            type="submit"
                            className={`${radixStyles.Button} ${radixStyles.ButtonBlue} w-full`}
                            disabled={loading}
                        >
                            {loading ? 'Sending Link...' : 'Send Reset Link'}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center text-gray-600">
                    Remember your password?{' '}
                    <Link href="/auth/login" className="text-blue-600 font-bold hover:underline">
                        Log In
                    </Link>
                </div>
            </div>
        </Layout>
    );
};

export default ForgotPasswordPage;
