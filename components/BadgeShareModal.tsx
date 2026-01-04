import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Share2, Download } from 'lucide-react';
import Image from 'next/image';

interface BadgeShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    badgeName: string;
    badgeDescription: string;
    badgeImageUrl?: string;
}

const BadgeShareModal: React.FC<BadgeShareModalProps> = ({
    isOpen,
    onClose,
    badgeName,
    badgeDescription,
    badgeImageUrl
}) => {
    if (!isOpen) return null;

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `I earned the ${badgeName} badge!`,
                    text: `I just earned the ${badgeName} badge on Hečhun! ${badgeDescription}`,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            alert('Sharing is not supported on this browser/device.');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative"
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>

                            <div className="p-8 flex flex-col items-center text-center">
                                {/* Badge Image */}
                                <div className="w-32 h-32 mb-6 relative">
                                    {badgeImageUrl ? (
                                        <Image
                                            src={badgeImageUrl}
                                            alt={badgeName}
                                            fill
                                            className="object-contain drop-shadow-lg"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-yellow-100 rounded-full flex items-center justify-center text-5xl border-4 border-yellow-300">
                                            🏅
                                        </div>
                                    )}
                                </div>

                                <h2 className="text-2xl font-bold text-gray-800 mb-2">{badgeName}</h2>
                                <p className="text-gray-600 mb-8">{badgeDescription}</p>

                                <div className="flex gap-4 w-full">
                                    <button
                                        onClick={handleShare}
                                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-transform active:scale-95"
                                    >
                                        <Share2 size={18} />
                                        Share
                                    </button>
                                    {/* Download button placeholder - functionality would require canvas generation */}
                                    <button
                                        className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-transform active:scale-95"
                                        onClick={() => alert('Download functionality coming soon!')}
                                    >
                                        <Download size={18} />
                                        Download
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default BadgeShareModal;
