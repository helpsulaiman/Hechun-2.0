import React from 'react';
import { NextPageContext } from 'next';
import Layout from '../components/Layout';
import Link from 'next/link';
import { AlertTriangle, Home } from 'lucide-react';

interface ErrorProps {
    statusCode?: number;
}

const ErrorPage = ({ statusCode }: ErrorProps) => {
    return (
        <Layout
            title={`Error ${statusCode || ''} - Hečhun`}
            noIndex={true} // Ensure error pages are not indexed
        >
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
                <div className="mb-6 bg-red-100 dark:bg-red-900/20 p-6 rounded-full">
                    <AlertTriangle className="w-16 h-16 text-red-500" />
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    {statusCode
                        ? `An error ${statusCode} occurred on server`
                        : 'An error occurred on client'}
                </h1>

                <p className="text-xl text-muted-foreground mb-10 max-w-md mx-auto">
                    Something went wrong. We apologize for the inconvenience.
                </p>

                <div className="flex gap-4">
                    <Link
                        href="/"
                        className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        Back Home
                    </Link>
                </div>
            </div>
        </Layout>
    );
};

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
};

export default ErrorPage;
