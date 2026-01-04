import React from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';

const NotFoundPage: React.FC = () => {
  return (
    <Layout title="Page Not Found - Kashmiri Idioms">
      <div className="container section">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-8xl mb-6">🔍</div>
          <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
          <p className="text-xl text-secondary mb-8">
            We&apos;re sorry, the page you&apos;re looking for doesn&apos;t exist.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/" className="btn btn-primary">
              Go Home
            </Link>
            <Link href="/submit" className="btn btn-outline">
              Submit an Idiom
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFoundPage;