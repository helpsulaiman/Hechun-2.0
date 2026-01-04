import React from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';

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
                    <motion.button
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => playAudio(item.audio)}
                        className="aspect-square bg-indigo-500/10 border-2 border-indigo-500/20 rounded-2xl flex flex-col items-center justify-center p-4 hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-colors group"
                    >
                        <span className="text-8xl mb-4 font-bold text-white text-kashmiri">{item.char}</span>
                        <span className="text-indigo-300 font-medium">{item.name}</span>
                        <Volume2 className="w-5 h-5 mt-4 text-indigo-400 opacity-50 group-hover:opacity-100" />
                    </motion.button>
                ))}
            </div>

            <div className="text-center text-gray-400 text-sm">
                Click each letter to hear its pronunciation.
            </div>
        </div>
    );
}
