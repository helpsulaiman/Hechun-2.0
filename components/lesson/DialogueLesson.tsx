import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { useAudio } from '../../lib/hooks/useAudio';

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
        <div className="space-y-8 max-w-2xl mx-auto">
            {content.lines.map((line, idx) => {
                const isLeft = line.speaker === 'A';
                return (
                    <DialogueBubble key={idx} line={line} isLeft={isLeft} delay={idx * 0.2} />
                );
            })}
        </div>
    );
}

function DialogueBubble({ line, isLeft, delay }: { line: DialogueLine, isLeft: boolean, delay: number }) {
    const { play, status } = useAudio(line.audio);

    return (
        <motion.div
            initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            className={`flex flex-col ${isLeft ? 'items-start' : 'items-end'}`}
        >
            <div className="text-xs text-gray-500 mb-1 px-2">Speaker {line.speaker}</div>
            <div
                className={`
                    max-w-[80%] p-4 rounded-2xl relative group cursor-pointer transition-colors border-2
                    ${isLeft
                        ? 'bg-indigo-600 text-white rounded-tl-none border-transparent'
                        : 'bg-gray-700 text-gray-100 rounded-tr-none border-transparent'}
                    ${status === 'playing' ? 'border-white/50 animate-pulse' : ''}
                    ${status === 'error' ? 'border-red-500/50' : ''}
                `}
                onClick={() => play()}
            >
                <div className="text-lg font-medium mb-1">{line.text}</div>
                <div className={`text-sm ${isLeft ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {line.meaning}
                </div>

                {/* Play overlay on hover or error */}
                <div className={`
                    absolute inset-0 flex items-center justify-center rounded-2xl transition-opacity
                    ${status === 'playing' ? 'opacity-0' : 'bg-black/10 opacity-0 group-hover:opacity-100'}
                `}>
                    {status === 'loading' ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : status === 'error' ? (
                        <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">Audio Missing</span>
                    ) : (
                        <Play className="w-6 h-6 fill-current" />
                    )}
                </div>
            </div>
        </motion.div>
    );
}
