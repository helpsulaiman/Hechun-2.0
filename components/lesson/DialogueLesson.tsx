import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { useAudio } from '../../lib/hooks/useAudio';

interface DialogueLine {
    speaker: string;
    text: string; // Original Script (Kashmiri)
    meaning: string; // Translation
    transliteration?: string; // New
    audio?: string;
}

interface DialogueLessonProps {
    content: {
        type: 'dialogue';
        lines: DialogueLine[];
    };
    showTransliteration?: boolean;
}

export default function DialogueLesson({ content, showTransliteration }: DialogueLessonProps) {
    return (
        <div className="space-y-8 max-w-[95%] mx-auto w-full">
            {content.lines.map((line, idx) => {
                const isLeft = line.speaker === 'A';
                return (
                    <DialogueBubble
                        key={idx}
                        line={line}
                        isLeft={isLeft}
                        delay={idx * 0.2}
                        showTransliteration={showTransliteration}
                    />
                );
            })}
        </div>
    );
}

function DialogueBubble({ line, isLeft, delay, showTransliteration }: { line: DialogueLine, isLeft: boolean, delay: number, showTransliteration?: boolean }) {
    const { play, status } = useAudio(line.audio);

    return (
        <motion.div
            initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            className={`flex flex-col ${isLeft ? 'items-start' : 'items-end'}`}
        >
            <div className="text-xs text-muted-foreground mb-1 px-2">Speaker {line.speaker}</div>
            <div
                className={`
                    max-w-[60%] p-4 rounded-2xl relative group cursor-pointer transition-colors border-2
                    ${isLeft
                        ? 'bg-primary text-primary-foreground rounded-tl-none border-transparent'
                        : 'bg-muted text-muted-foreground rounded-tr-none border-transparent'}
                    ${status === 'playing' ? 'border-primary/50 animate-pulse' : ''}
                    ${status === 'error' ? 'border-destructive/50' : ''}
                `}
                onClick={() => play()}
            >
                <div className="text-xl font-medium mb-1 text-kashmiri">{line.text}</div>

                {showTransliteration && line.transliteration && (
                    <div className="text-sm font-mono opacity-80 mb-1 italic">
                        {line.transliteration}
                    </div>
                )}

                <div className={`text-sm opacity-90`}>
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
