import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, AlertCircle } from 'lucide-react';
import { useAudio } from '../../lib/hooks/useAudio';

interface PhoneticItem {
    char: string;
    name: string;
    audio: string;
}

interface PhoneticLessonProps {
    content: {
        type: 'phonetic';
        letters: PhoneticItem[];
    };
    onComplete: () => void;
}

export default function PhoneticLesson({ content, onComplete }: PhoneticLessonProps) {
    const playAudio = (path: string) => {
        // In a real app, uses HTML5 Audio
        // const audio = new Audio(path);
        // audio.play().catch(e => console.log("Audio play failed (no file):", e));
        console.log(`Playing audio: ${path}`);
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {content.letters.map((item, idx) => (
                    <PhoneticCard key={idx} item={item} />
                ))}
            </div>

            <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
                Click the speaker icon to hear pronunciation.
            </div>
        </div>
    );
}

function PhoneticCard({ item }: { item: PhoneticItem }) {
    const { play, status } = useAudio(item.audio);

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => play()}
            className={`
                aspect-square bg-card border-2 border-border rounded-2xl flex flex-col items-center justify-center p-4 transition-colors group relative overflow-hidden
                ${status === 'playing'
                    ? 'border-primary bg-accent'
                    : 'hover:bg-muted hover:border-primary/50'
                }
                ${status === 'error' ? 'border-destructive/30 bg-destructive/10' : ''}
            `}
        >
            <span className="text-8xl mb-4 font-bold text-foreground text-kashmiri">{item.char}</span>
            <span className="text-primary font-medium">{item.name}</span>
            <div className={`mt-4 ${status === 'playing' ? 'text-primary animate-pulse' : 'text-muted-foreground opacity-50 group-hover:opacity-100'}`}>
                {status === 'error' ? <AlertCircle className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
            </div>
        </motion.button>
    );
}
