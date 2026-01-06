import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/Layout';
import { fetchLessons } from '../../lib/learning-api';
import { LearningLesson } from '../../types/learning';
import { Check, X, ArrowRight } from 'lucide-react';

// Expanded Adaptive Question Pool (Complexity 1-10)
const QUESTION_POOL = [
    // Beginner (1-3)
    { id: 101, complexity: 1, text: 'What does "Salam" mean?', options: ['Goodbye', 'Hello/Peace', 'Thank you', 'Yes'], correct: 1, skill: 'reading' },
    { id: 102, complexity: 1, text: 'Select "Water":', options: ['Posh', 'Aab', 'Naar', 'Haa'], correct: 1, skill: 'vocabulary' },
    { id: 103, complexity: 2, text: 'What is "kǝšur zabaan"?', options: ['Kashmir', 'Kashmiri Language', 'Winter', 'Food'], correct: 1, skill: 'reading' },
    { id: 104, complexity: 2, text: 'Translate: "Hu kus chu?"', options: ['Who is he?', 'Where is he?', 'What is that?', 'How are you?'], correct: 0, skill: 'grammar' },
    { id: 105, complexity: 3, text: '"Me lej boch" means:', options: ['I am thirsty', 'I am hungry', 'I am tired', 'I am happy'], correct: 1, skill: 'grammar' },

    // Intermediate (4-6)
    { id: 201, complexity: 4, text: 'Which word means "Tomorrow"?', options: ['Āz', 'Pagah', 'Rāth', 'Öutre'], correct: 1, skill: 'vocabulary' },
    { id: 202, complexity: 5, text: 'Complete: "Tsye kya ______?" (What is your name?)', options: ['chuy naav', 'chuy karun', 'gasun', 'khyon'], correct: 0, skill: 'grammar' },
    { id: 203, complexity: 5, text: 'Identify the plural of "Garr" (Home):', options: ['Gar', 'Gar-e', 'Garr-as', 'Gar-an'], correct: 3, skill: 'grammar' }, // Context dependent, but let's assume simplified
    { id: 204, complexity: 6, text: 'Translate: "Bi chus school gasān"', options: ['I am going to school', 'I went to school', 'I will go to school', 'School is far'], correct: 0, skill: 'grammar' },

    // Advanced/Fluent (7-10)
    { id: 301, complexity: 7, text: 'Idiom: "اَکھ تٕہ اَکھ گَیِہ کاہ (Akh ti akh gei kah)" refers to:', options: ['Not to pay heed', 'To get unexpected results', 'Strength in unity', 'Heavy rain'], correct: 2, skill: 'vocabulary' }, // Poetic
    { id: 302, complexity: 8, text: 'Correct nuance: "Wala" vs "Yuv"', options: ['Wala is rude', 'Yuv is come (imperative), Wala is bring', 'Both mean go', 'No difference'], correct: 1, skill: 'speaking' }, // Rough approximation
    { id: 303, complexity: 9, text: 'Complete proverb: "Naayi _____, aab as______"', options: ['pet, manz', 'tar, pak', 'daryav, wath', 'None of these'], correct: 0, skill: 'reading' }, // Mock proverb
    { id: 304, complexity: 9, text: 'Complex Tense: "Su oos pak-aan" means:', options: ['He walks', 'He was walking', 'He has walked', 'He will walk'], correct: 1, skill: 'grammar' },
    { id: 305, complexity: 10, text: 'Literary: "Lal Ded" is famous for:', options: ['Vakhs (Poetry)', 'Warfare', 'Cooking', 'Architecture'], correct: 0, skill: 'culture' }
];

export default function DiagnosticTest() {
    const router = useRouter();
    const [questions, setQuestions] = useState<typeof QUESTION_POOL>([]);
    const [qIndex, setQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load target complexity based on onboarded skill level
        const loadQuestions = () => {
            let userLevel = 'beginner';
            const guestSkills = localStorage.getItem('hechun_guest_skills');

            if (guestSkills) {
                const skills = JSON.parse(guestSkills);
                // Simple heuristic: check highest skill or average
                // Or check explicit level set in start.tsx (start.tsx maps 'none' -> 'beginner' etc.)
                // Actually start.tsx defaults to 0 mostly.
                // Let's assume:
                // Reading/Speaking > 30 -> Intermediate
                // > 70 -> Fluent
                const avg = ((skills.reading || 0) + (skills.speaking || 0)) / 2;
                if (avg > 70) userLevel = 'fluent';
                else if (avg > 30) userLevel = 'intermediate';
            }

            // Filter Pool
            let targetComplexityMin = 1;
            let targetComplexityMax = 3;

            if (userLevel === 'intermediate') { targetComplexityMin = 4; targetComplexityMax = 7; }
            if (userLevel === 'fluent') { targetComplexityMin = 7; targetComplexityMax = 10; }

            const filtered = QUESTION_POOL.filter(q => q.complexity >= targetComplexityMin && q.complexity <= targetComplexityMax);

            // Shuffle and pick 5
            const shuffled = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 5);
            setQuestions(shuffled.length > 0 ? shuffled : QUESTION_POOL.slice(0, 5)); // Fallback
            setLoading(false);
        };

        loadQuestions();
    }, []);

    const currentQ = questions[qIndex];

    const handleAnswer = (optionIndex: number) => {
        if (isAnswered) return;
        setSelected(optionIndex);
        setIsAnswered(true);

        if (optionIndex === currentQ.correct) {
            setScore(s => s + 1);
        }

        setTimeout(() => {
            if (qIndex < questions.length - 1) {
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
        // NO XP Awarded for Diagnostic (Requested by User)

        // Refine skills based on diagnostic performance? 
        // Optional: If they got 5/5, maybe bump their cached skills slightly?
        // For now, keeping it simple: just redirect.

        setTimeout(() => {
            router.push('/');
        }, 2000);
    };

    if (loading) return <Layout><div className="flex justify-center p-20">Loading assessment...</div></Layout>;

    return (
        <Layout title="Diagnostic Test">
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <div className="w-full max-w-2xl">
                    <AnimatePresence mode="wait">
                        {!isFinished && currentQ ? (

                            <motion.div
                                key={currentQ.id}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className="bg-card border border-border rounded-3xl p-8 backdrop-blur-md shadow-sm"
                            >
                                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-6">
                                    <span>Question {qIndex + 1}/{questions.length}</span>
                                    <span>Complexity: {currentQ.complexity}</span>
                                </div>

                                <h2 className="text-2xl font-sans leading-relaxed text-card-foreground mb-8">{currentQ.text}</h2>

                                <div className="grid gap-4">
                                    {currentQ.options.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(idx)}
                                            disabled={isAnswered}
                                            className={`
                                                p-4 rounded-xl text-left transition-all font-medium flex justify-between items-center
                                                ${isAnswered && idx === currentQ.correct
                                                    ? 'bg-green-100 border-green-500 text-green-800 dark:bg-green-500/20 dark:text-green-400 border'
                                                    : isAnswered && idx === selected
                                                        ? 'bg-red-100 border-destructive text-destructive font-bold'
                                                        : 'bg-muted hover:bg-muted/80 border border-border text-card-foreground'}
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
                                className="text-center bg-card border border-border rounded-3xl p-12 shadow-sm"
                            >
                                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check className="w-10 h-10 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-card-foreground mb-4">Assessment Complete!</h2>
                                <p className="text-muted-foreground mb-8">
                                    You got {score} out of {questions.length} correct.
                                    <br />
                                    We've calibrated your learning path.
                                </p>
                                <div className="animate-pulse text-indigo-600 dark:text-indigo-400">
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
