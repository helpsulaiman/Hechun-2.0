import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const LoginPage = () => {
    const router = useRouter();

    const handleAdminLogin = () => {
        // Redirect to Auth0 login with admin prompt (v4 uses /auth/login)
        router.push('/auth/login?returnTo=/dashboard');
    };

    return (
        <Layout title="Dashboard Login" noIndex={true}>
            <div className="form-container" style={{ maxWidth: '450px' }}>
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-2">Dashboard Login</h1>
                    <p className="text-muted-foreground mb-8">Please sign in to continue.</p>
                </div>

                {/* Admin Login Button */}
                <button
                    onClick={handleAdminLogin}
                    className="w-full px-6 py-3 mb-4 text-base font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
                >
                    Sign in as Admin
                </button>

                <p className="text-center text-sm text-muted-foreground mt-6">
                    Not an admin?{' '}
                    <a
                        href="/auth/login"
                        className="text-primary font-medium hover:underline"
                    >
                        Sign in as User
                    </a>
                </p>

                <p className="text-center text-xs text-muted-foreground mt-4">
                    Only authorized administrators can access the dashboard.
                </p>
            </div>
        </Layout>
    );
};

export default LoginPage;