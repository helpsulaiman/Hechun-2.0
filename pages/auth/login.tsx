import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

export default function Login() {
    const { loginWithRedirect, isLoading, error } = useAuth0();
    const router = useRouter();
    const { returnTo } = router.query;

    useEffect(() => {
        // If not loading and no error, redirect to Auth0
        if (!isLoading && !error) {
            loginWithRedirect({
                appState: {
                    returnTo: returnTo ? String(returnTo) : '/dashboard',
                },
            });
        }
    }, [isLoading, error, loginWithRedirect, returnTo]);

    if (error) {
        return (
            <Layout title="Login Error">
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <h1 className="text-2xl font-bold text-red-500">Login Error</h1>
                    <p>{error.message}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="btn btn-secondary"
                    >
                        Back to Home
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Redirecting to Login...">
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Redirecting to login...</p>
            </div>
        </Layout>
    );
}
