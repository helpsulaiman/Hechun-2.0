import React from 'react';
import { Volume2, AlertCircle, Loader2 } from 'lucide-react';
import { useAudio } from '../../lib/hooks/useAudio';
import { motion } from 'framer-motion';

interface AudioPlayerProps {
    src: string;
    label?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string; // Allow extra styling
}

export default function AudioPlayer({ src, label, size = 'md', className = '' }: AudioPlayerProps) {
    const { play, status } = useAudio(src);

    const sizeClasses = {
        sm: 'p-1.5',
        md: 'p-3',
        lg: 'p-4'
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
                e.stopPropagation(); // Prevent parent clicks
                play();
            }}
            disabled={status === 'error'}
            className={`
                rounded-full transition-colors flex items-center justify-center
                ${status === 'playing' ? 'bg-indigo-500 text-white animate-pulse' : 'bg-white/10 hover:bg-indigo-500 hover:text-white'}
                ${status === 'error' ? 'opacity-50 cursor-not-allowed bg-red-500/10 hover:bg-red-500/10' : ''}
                ${sizeClasses[size]}
                ${className}
            `}
            title={status === 'error' ? 'Audio missing' : 'Play audio'}
        >
            {status === 'loading' ? (
                <Loader2 className={`${iconSizes[size]} animate-spin`} />
            ) : status === 'error' ? (
                <AlertCircle className={`${iconSizes[size]} text-red-400`} />
            ) : (
                <Volume2 className={iconSizes[size]} />
            )}
            {label && <span className="ml-2 text-sm font-medium">{label}</span>}
        </motion.button>
    );
}
