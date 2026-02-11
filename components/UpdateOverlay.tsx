import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface UpdateOverlayProps {
    isVisible: boolean;
}

const UpdateOverlay: React.FC<UpdateOverlayProps> = ({ isVisible }) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="mb-6"
                    >
                        <RefreshCw className="w-16 h-16 text-primary" />
                    </motion.div>

                    <h2 className="text-2xl font-bold mb-2">Updating Application</h2>
                    <p className="text-gray-300">Adding new features and improvements...</p>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default UpdateOverlay;
