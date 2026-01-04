import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

interface DialogueLine {
    speaker: string;
    text: string;
    meaning: string;
    audio?: string;
}

interface DialogueLessonProps {
    content: {
        type: 'dialogue';
        lines: DialogueLine[];
    };
}

export default function DialogueLesson({ content }: DialogueLessonProps) {
    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {content.lines.map((line, idx) => {
                const isLeft = line.speaker === 'A';
                return (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.2 }}
                        className={`flex flex-col ${isLeft ? 'items-start' : 'items-end'}`}
                    >
                        <div className="text-xs text-gray-500 mb-1 px-2">Speaker {line.speaker}</div>
                        <div
                            className={`
                                max-w-[80%] p-4 rounded-2xl relative group cursor-pointer
                                ${isLeft
                                    ? 'bg-indigo-600 text-white rounded-tl-none'
                                    : 'bg-gray-700 text-gray-100 rounded-tr-none'}
                            `}
                            onClick={() => console.log(`Play quote: ${line.text}`)}
                        >
                            <div className="text-lg font-medium mb-1">{line.text}</div>
                            <div className={`text-sm ${isLeft ? 'text-indigo-200' : 'text-gray-400'}`}>
                                {line.meaning}
                            </div>

                            {/* Play overlay on hover */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity">
                                <Play className="w-6 h-6 fill-current" />
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
