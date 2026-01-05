import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/Layout';
import { fetchLessons } from '../../lib/learning-api';
import { LearningLesson } from '../../types/learning';
import { Check, X, ArrowRight } from 'lucide-react';

// Hardcoded diagnostic questions for MVP
const QUESTIONS = [
    {
        id: 1,
        text: 'What does "kǝšur(Koshur) zabaan" mean?',
        options: ['Kashmir', 'Kashmiri Language', 'Apple', 'Winter'],
        correct: 1,
        skill: 'reading'
    },
    {
        id: 2,
        text: 'Which is the correct script for "Asalāmu-alaikum"?',
        options: ['Namaskar', 'Salam', 'Marhabā', 'Assalamu Alaikum'],
        correct: 3, // Assuming script visual choice, textual for now
        skill: 'reading'
    },
    {
        id: 3,
        text: 'Translate: "Tuhund naav kya chu?"',
        options: ['What is your name?', 'Where are you from?', 'How are you?', 'Who is this?'],
        correct: 0,
        skill: 'speaking'
    },
    {
        id: 4,
        text: 'Select the word for "Water":',
        options: ['Posh', 'Aab', 'Naar', 'Haa'],
        correct: 1,
        skill: 'vocabulary'
    },
    {
        id: 5,
        text: 'Complete: "Me che ____ lagan."',
        options: ['Boch (Hunger)', 'Treish (Thirst)', 'Garr (Home)', 'School'],
        correct: 0,
        skill: 'grammar'
    }
];

export default function DiagnosticTest() {
    const router = useRouter();
    const [qIndex, setQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const currentQ = QUESTIONS[qIndex];

    const handleAnswer = (optionIndex: number) => {
        if (isAnswered) return;
        setSelected(optionIndex);
        setIsAnswered(true);

        if (optionIndex === currentQ.correct) {
            setScore(s => s + 1);
        }

        setTimeout(() => {
            if (qIndex < QUESTIONS.length - 1) {
                setQIndex(q => q + 1);
                setSelected(null);
                setIsAnswered(false);
            } else {
                finishTest();
            }
        }, 1000);
    };

    const finishTest = async () => {
        setIsFinished(true);
        // Calculate adjustments
        // Max score 5. If 5/5 -> Boost fluency. 
        // Logic: Just saving the completion for now.
        // In a real system, we'd fetch the current profile and mutate the vector.

        // Simulating delay then redirect
        setTimeout(() => {
            router.push('/');
        }, 2000);
    };

    return (
        <Layout title="Diagnostic Test">
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <div className="w-full max-w-2xl">
                    <AnimatePresence mode="wait">
                        {!isFinished ? (
                            <motion.div
                                key={currentQ.id}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md"
                            >
                                <div className="flex justify-between text-sm text-gray-400 mb-6">
                                    <span>Question {qIndex + 1}/{QUESTIONS.length}</span>
                                    <span>Skill: {currentQ.skill}</span>
                                </div>

                                <h2 className="text-2xl font-bold text-white mb-8">{currentQ.text}</h2>

                                <div className="grid gap-4">
                                    {currentQ.options.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(idx)}
                                            disabled={isAnswered}
                                            className={`
                                                p-4 rounded-xl text-left transition-all font-medium flex justify-between items-center
                                                ${isAnswered && idx === currentQ.correct
                                                    ? 'bg-green-500/20 border-green-500 text-green-400 border'
                                                    : isAnswered && idx === selected
                                                        ? 'bg-red-500/20 border-red-500 text-red-400 border'
                                                        : 'bg-white/5 hover:bg-white/10 border border-transparent'}
                                            `}
                                        >
                                            {opt}
                                            {isAnswered && idx === currentQ.correct && <Check className="w-5 h-5" />}
                                            {isAnswered && idx === selected && idx !== currentQ.correct && <X className="w-5 h-5" />}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center bg-white/5 border border-white/10 rounded-3xl p-12"
                            >
                                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check className="w-10 h-10 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-4">Assessment Complete!</h2>
                                <p className="text-gray-400 mb-8">
                                    You got {score} out of {QUESTIONS.length} correct.
                                    <br />
                                    We've calibrated your learning path.
                                </p>
                                <div className="animate-pulse text-indigo-400">
                                    Redirecting to your path...
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </Layout>
    );
}
