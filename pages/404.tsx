import React from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import { Home, MoveLeft, MapPinOff } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFoundPage: React.FC = () => {
  return (
    <Layout title="Page Not Found - Hechun">
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 relative"
        >
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full"></div>
          <MapPinOff className="w-32 h-32 text-indigo-500 relative z-10" />
        </motion.div>

        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 mb-4">
          404
        </h1>

        <p className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Path Not Found
        </p>

        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-10">
          Looks like you've wandered off the learning path. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Dashboard
          </Link>

          <button
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 dark:bg-white/5 dark:text-gray-300 dark:border-white/10 dark:hover:bg-white/10 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          >
            <MoveLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFoundPage;