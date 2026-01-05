import React from 'react';
import { Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StreakBadgeProps {
    streak: number;
    loading?: boolean;
}

export default function StreakBadge({ streak, loading = false }: StreakBadgeProps) {
    if (loading) return null; // Or skeleton

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-lg backdrop-blur-md transition-colors ${streak > 0
                    ? 'bg-white/10 border-white/20 text-orange-400'
                    : 'bg-gray-800/50 border-gray-700/50 text-gray-400'
                    }`}
                title={streak > 0 ? `${streak} Day Streak!` : 'Start your streak today!'}
            >
                <Flame className={`w-4 h-4 ${streak > 0 ? 'fill-current animate-pulse' : 'text-gray-500'}`} />
                <span className="text-sm font-bold">{streak}</span>
            </motion.div>
        </AnimatePresence>
    );
}
