import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, LogIn } from 'lucide-react';
import { useRouter } from 'next/router';

interface GuestLoginNudgeProps {
    className?: string; // Allow custom styling/positioning
    show?: boolean;      // Forced show state (optional)
    onDismiss?: () => void;
}

export default function GuestLoginNudge({ className = "", show: forceShow, onDismiss }: GuestLoginNudgeProps) {
    const [isVisible, setIsVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (typeof forceShow !== 'undefined') {
            setIsVisible(forceShow);
            return;
        }

        // Logic to auto-determine if we should show it (e.g. on Dashboard)
        const checkGuestStatus = () => {
            // Only show if user is NOT logged in (this component should probably only be rendered if !user, but we check here too)
            // Actually, parent should handle "if !user". 

            // Check progress
            const progressKey = 'hechun_guest_progress_counts';
            const storedCounts = localStorage.getItem(progressKey);
            if (storedCounts) {
                try {
                    const counts = JSON.parse(storedCounts);
                    const count = Object.keys(counts).length;
                    // Show if they have done at least 1 lesson? Or 2? 
                    // User requirement: "after a specified number... e.g. 2"
                    if (count >= 2) {
                        setIsVisible(true);
                    }
                } catch (e) { }
            }
        };

        checkGuestStatus();
    }, [forceShow]);

    const handleDismiss = () => {
        setIsVisible(false);
        if (onDismiss) onDismiss();
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: 'auto', opacity: 1, marginTop: 24 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                className={`w-full overflow-hidden ${className}`}
            >
                <div className="bg-white dark:bg-slate-900/90 border border-gray-200 dark:border-indigo-500/30 shadow-xl rounded-2xl p-5 relative flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left backdrop-blur-sm">
                    <button
                        onClick={handleDismiss}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="p-3 bg-indigo-500/20 rounded-full text-indigo-400 shrink-0">
                        <Lock className="w-8 h-8" />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Save your streak? 🔥</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            You've completed 2+ lessons! Create a free account to <b>save your XP</b> and <b>join the leaderboard</b>.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[140px]">
                        <button
                            onClick={() => router.push('/login')}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 text-sm"
                        >
                            <LogIn className="w-4 h-4" />
                            Create Account
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="text-xs text-gray-500 hover:text-gray-400 dark:text-gray-400 font-medium underline"
                        >
                            Maybe later
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
