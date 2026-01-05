import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface QuizStepProps {
    content: {
        question: string;
        transliteration?: string;
        options: Array<string | { text: string; transliteration?: string }>;
        correct_index?: number; // New standard
        correct_answer?: string; // Legacy support
    };
    showTransliteration?: boolean;
    onComplete: (success: boolean) => void;
}

export default function QuizStep({ content, showTransliteration, onComplete }: QuizStepProps) {
    const [selected, setSelected] = useState<number | null>(null);
    const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

    // Normalize options to objects
    const normalizedOptions = content.options.map(opt =>
        typeof opt === 'string' ? { text: opt, transliteration: undefined } : opt
    );

    const handleSelect = (idx: number) => {
        if (status === 'correct') return;
        setSelected(idx);
        setStatus('idle');
    };

    const handleCheck = () => {
        if (selected === null) return;

        let isCorrect = false;
        // Check by index (preferred) or text (legacy)
        if (content.correct_index !== undefined) {
            isCorrect = selected === content.correct_index;
        } else if (content.correct_answer) {
            isCorrect = normalizedOptions[selected].text === content.correct_answer;
        }

        if (isCorrect) {
            setStatus('correct');
            onComplete(true);
        } else {
            setStatus('wrong');
            onComplete(false);
            setTimeout(() => setStatus('idle'), 1000);
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-lg mx-auto space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {content.question}
                </h3>
                {showTransliteration && content.transliteration && (
                    <p className="text-indigo-600 dark:text-indigo-300 font-mono mt-2 text-lg">
                        {content.transliteration}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {normalizedOptions.map((option, idx) => {
                    const isSelected = selected === idx;
                    const isCorrect = status === 'correct' && isSelected;
                    const isWrong = status === 'wrong' && isSelected;

                    return (
                        <motion.button
                            key={idx}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelect(idx)}
                            className={`
                                relative p-6 rounded-2xl border-2 text-xl font-bold transition-all text-left flex flex-col justify-center
                                    ? 'border-indigo-500 bg-indigo-500/20 text-indigo-900 dark:text-white shadow-lg shadow-indigo-500/10'
                                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:border-white/20'
                                }
                                ${isCorrect ? '!border-green-500 !bg-green-500/20 !text-green-400' : ''}
                                ${isWrong ? '!border-red-500 !bg-red-500/20 !text-red-400' : ''}
                            `}
                        >
                            <span className="text-kashmiri">{option.text}</span>
                            {showTransliteration && option.transliteration && (
                                <span className="text-sm text-gray-500 dark:text-indigo-300/80 font-mono font-normal mt-1">
                                    {option.transliteration}
                                </span>
                            )}

                            {isCorrect && (
                                <div className="absolute top-2 right-2 text-green-400">
                                    <Check className="w-5 h-5" />
                                </div>
                            )}
                            {isWrong && (
                                <div className="absolute top-2 right-2 text-red-400">
                                    <X className="w-5 h-5" />
                                </div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            <button
                disabled={selected === null || status === 'correct'}
                onClick={handleCheck}
                className={`
                    w-full py-4 rounded-xl font-bold text-lg transition-all
                    ${status === 'correct'
                        ? 'bg-green-500 text-white cursor-default'
                        : selected !== null
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }
                `}
            >
                {status === 'correct' ? 'Correct!' : status === 'wrong' ? 'Try Again' : 'Check Answer'}
            </button>
        </div>
    );
}
