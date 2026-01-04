import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Badge } from '../types/learning';

interface BadgePopupProps {
    badge: Badge | null;
    onClose: () => void;
}

const BadgePopup: React.FC<BadgePopupProps> = ({ badge, onClose }) => {
    useEffect(() => {
        if (badge) {
            // Trigger confetti
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);

                // since particles fall down, start a bit higher than random
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
            }, 250);

            return () => clearInterval(interval);
        }
    }, [badge]);

    return (
        <AnimatePresence>
            {badge && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center relative overflow-hidden border border-yellow-500/30"
                    >
                        {/* Shine effect background */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/10 via-transparent to-purple-500/10 pointer-events-none" />

                        <div className="relative z-10">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="mb-6 flex justify-center"
                            >
                                <div className="relative w-32 h-32 flex items-center justify-center">
                                    {/* Glowing background behind badge */}
                                    <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-20" />

                                    {badge.icon_url ? (
                                        <img
                                            src={badge.icon_url}
                                            alt={badge.name}
                                            className="w-full h-full object-contain relative z-10 drop-shadow-xl"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg relative z-10">
                                            <span className="text-4xl">🏆</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-orange-600 mb-2">
                                    New Badge!
                                </h2>
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                                    {badge.name}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-8">
                                    {badge.description || "You've unlocked a new achievement!"}
                                </p>
                            </motion.div>

                            <motion.button
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                className="w-full py-3 px-6 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/30 transition-shadow"
                            >
                                Awesome!
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default BadgePopup;
