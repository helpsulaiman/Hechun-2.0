import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight, Volume2 } from 'lucide-react';

interface InputStepProps {
    content: {
        phrase?: string; // The prompt text
        transliteration?: string;
        correct_answer: string;
        alternate_answers?: string[];
        audio_url?: string;
        hint?: string;
        placeholder?: string;
    };
    showTransliteration?: boolean;
    onComplete: (success: boolean) => void;
}

export default function InputStep({ content, showTransliteration, onComplete }: InputStepProps) {
    const [input, setInput] = useState('');
    const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

    const playAudio = () => {
        if (content.audio_url) {
            const audio = new Audio(content.audio_url);
            audio.play().catch(e => console.error(e));
        }
    };

    const normalize = (str: string) => {
        return str.toLowerCase()
            .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "") // Remove punctuation
            .replace(/\s{2,}/g, " ") // Collapse spaces
            .trim();
    };

    const handleCheck = () => {
        if (!input.trim()) return;

        const guess = normalize(input);
        const uniqueCorrect = new Set([
            content.correct_answer,
            ...(content.alternate_answers || [])
        ].map(a => normalize(a)));

        if (uniqueCorrect.has(guess)) {
            setStatus('correct');
            onComplete(true);
        } else {
            setStatus('wrong');
            onComplete(false);
            // Don't auto-reset for input, let them see their mistake
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && status !== 'correct') {
            handleCheck();
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-lg mx-auto space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Prompt Area */}
            <div className="text-center space-y-4">
                {content.audio_url && (
                    <button
                        onClick={playAudio}
                        className="p-4 bg-indigo-600/20 hover:bg-indigo-600/30 rounded-full text-indigo-300 transition-colors mb-2"
                    >
                        <Volume2 className="w-8 h-8" />
                    </button>
                )}

                {content.phrase && (
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {content.phrase}
                    </h3>
                )}

                {showTransliteration && content.transliteration && (
                    <p className="text-indigo-600 dark:text-indigo-300 font-mono text-lg">
                        {content.transliteration}
                    </p>
                )}

                {content.hint && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                        Hint: {content.hint}
                    </p>
                )}
            </div>

            {/* Input Area */}
            <div className="w-full relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        if (status === 'wrong') setStatus('idle');
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={status === 'correct'}
                    placeholder={content.placeholder || "Type your answer..."}
                    className={`
                        w-full p-5 rounded-2xl bg-white border-2 text-xl text-gray-900 placeholder-gray-400 outline-none transition-all
                        dark:bg-white/10 dark:text-white dark:placeholder-gray-500
                        ${status === 'idle' ? 'border-gray-200 focus:border-indigo-500 focus:bg-gray-50 dark:border-white/10 dark:focus:bg-white/15' : ''}
                        ${status === 'correct' ? '!border-green-500 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-200' : ''}
                        ${status === 'wrong' ? '!border-red-500 bg-red-50 dark:bg-red-500/10' : ''}
                    `}
                />

                {status === 'correct' && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400">
                        <Check className="w-6 h-6" />
                    </div>
                )}
                {status === 'wrong' && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400">
                        <X className="w-6 h-6" />
                    </div>
                )}
            </div>

            {/* Feedback / Action */}
            <button
                disabled={!input.trim() || status === 'correct'}
                onClick={handleCheck}
                className={`
                    w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2
                    ${status === 'correct'
                        ? 'bg-green-500 text-white cursor-default'
                        : input.trim()
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }
                `}
            >
                {status === 'correct' ? 'Correct!' : status === 'wrong' ? 'Try Again' : 'Check'}
            </button>

            {status === 'wrong' && (
                <div className="text-center animate-in fade-in slide-in-from-top-2">
                    <p className="text-red-300 mb-1">Not quite.</p>
                    <p className="text-gray-400 text-sm">Correct answers: <span className="text-white font-medium">{content.correct_answer}</span>
                        {content.alternate_answers && content.alternate_answers.length > 0 && (
                            <span className="text-gray-600 dark:text-gray-500">, {content.alternate_answers.join(', ')}</span>
                        )}
                    </p>
                </div>
            )}
        </div>
    );
}
