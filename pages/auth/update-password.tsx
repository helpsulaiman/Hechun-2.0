import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import radixStyles from '../../styles/RadixTabs.module.css';

const UpdatePasswordPage: React.FC = () => {
    const supabase = useSupabaseClient();
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // In a real flow, the user arrives here with an access token from the email link.
    // Supabase Auth helper handles the session automatically if the link is correct.
    // However, if they just visit this page without a session (hash fragment), we might want to redirect them.
    // But for simplicity, we'll let them try to update. If no session, it will fail or we can check session.

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;
            router.push('/hechun'); // Redirect to home/dashboard
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout title="Update Password - Hečhun">
            <div className="form-container" style={{ maxWidth: '450px' }}>
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-2">Update Password</h1>
                    <p className="text-muted-foreground mb-8">Enter your new password below.</p>
                </div>

                <form onSubmit={handleUpdate}>
                    <fieldset className={radixStyles.Fieldset}>
                        <label htmlFor="password" className={radixStyles.Label}>
                            New Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={radixStyles.Input}
                            required
                            minLength={6}
                        />
                    </fieldset>

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
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default UpdatePasswordPage;
