
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface QuizStepProps {
    content: {
        question: string;
        options: string[];
        correct_answer: string;
    };
    onComplete: (success: boolean) => void;
}

export default function QuizStep({ content, onComplete }: QuizStepProps) {
    const [selected, setSelected] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

    const handleSelect = (option: string) => {
        if (status === 'correct') return; // Locked if already correct
        setSelected(option);
        setStatus('idle');
    };

    const handleCheck = () => {
        if (!selected) return;

        if (selected === content.correct_answer) {
            setStatus('correct');
            onComplete(true);
        } else {
            setStatus('wrong');
            onComplete(false);

            // Shake effect could be triggered here by parent or local state
            setTimeout(() => setStatus('idle'), 1000);
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-lg mx-auto space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <h3 className="text-2xl font-bold text-white text-center mb-4">
                {content.question}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {content.options.map((option, idx) => {
                    const isSelected = selected === option;
                    const isCorrect = status === 'correct' && isSelected;
                    const isWrong = status === 'wrong' && isSelected;

                    return (
                        <motion.button
                            key={idx}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelect(option)}
                            className={`
                                relative p-6 rounded-2xl border-2 text-xl font-bold transition-all
                                ${isSelected
                                    ? 'border-indigo-500 bg-indigo-500/20 text-white shadow-lg shadow-indigo-500/10'
                                    : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:border-white/20'
                                }
                                ${isCorrect ? '!border-green-500 !bg-green-500/20 !text-green-400' : ''}
                                ${isWrong ? '!border-red-500 !bg-red-500/20 !text-red-400' : ''}
                            `}
                        >
                            <span className="text-kashmiri">{option}</span>

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
                disabled={!selected || status === 'correct'}
                onClick={handleCheck}
                className={`
                    w-full py-4 rounded-xl font-bold text-lg transition-all
                    ${status === 'correct'
                        ? 'bg-green-500 text-white cursor-default'
                        : selected
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
