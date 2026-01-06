import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/Layout';
import { Check, X } from 'lucide-react';

type QuestionCategory = 'speaking' | 'reading_writing' | 'grammar_vocabulary';

interface Question {
    id: number;
    complexity: number;
    text: string;
    options: string[];
    correct: number;
    category: QuestionCategory;
    skill: 'speaking' | 'reading' | 'writing' | 'grammar' | 'vocabulary' | 'culture';
}

// Mock Pool - In production this should be larger (20 per category * 10 complexity levels ideally)
const QUESTION_POOL: Question[] = [
    // --- SPEAKING ---
    { id: 101, complexity: 1, category: 'speaking', skill: 'speaking', text: 'How do you say "Hello"?', options: ['Salam', 'Kyah', 'Na', 'Awa'], correct: 0 },
    { id: 102, complexity: 5, category: 'speaking', skill: 'speaking', text: 'Response to "Tuhey kyah chiv karan?"', options: ['Bi chus gatshan', 'Bi chus parān', 'Salam', 'Awa'], correct: 1 },
    { id: 103, complexity: 8, category: 'speaking', skill: 'speaking', text: 'Nuance: "Hata!" is used for?', options: ['Respectful address', 'Calling a male friend (informal)', 'Calling a female', 'Scolding'], correct: 1 },
    { id: 104, complexity: 3, category: 'speaking', skill: 'speaking', text: '"Tohi chiv varaay?" means:', options: ['Are you well?', 'Who are you?', 'Where is it?', 'Come here'], correct: 0 },
    { id: 105, complexity: 6, category: 'speaking', skill: 'speaking', text: 'Formal way to say "Sit down":', options: ['Beh', 'Behiv', 'Tul', 'Gats'], correct: 1 },
    { id: 106, complexity: 2, category: 'speaking', skill: 'speaking', text: 'Saying "Thank you":', options: ['Shukriya', 'Salam', 'Adab', 'Bas'], correct: 0 },
    { id: 107, complexity: 9, category: 'speaking', skill: 'speaking', text: 'Correct intonation for "Kyah?" (What?) vs "Kyah!" (Really!):', options: ['Rising vs Falling', 'Falling vs Rising', 'Flat vs High', 'No difference'], correct: 0 },
    { id: 108, complexity: 4, category: 'speaking', skill: 'speaking', text: '"Me lej tresh" expresses:', options: ['Thirst', 'Hunger', 'Pain', 'Joy'], correct: 0 },
    { id: 109, complexity: 7, category: 'speaking', skill: 'speaking', text: 'Native idiom for "I understand":', options: ['Me aav gats', 'Me pyav fikri', 'Bi chus zanan', 'Me gov maloom'], correct: 1 },
    { id: 110, complexity: 10, category: 'speaking', skill: 'speaking', text: 'Complex polite command: "Tohi heykiyav..."', options: ['You could...', 'You must...', 'Why did you...', 'Are you...'], correct: 0 },

    // --- READING / WRITING ---
    { id: 201, complexity: 1, category: 'reading_writing', skill: 'reading', text: 'Letter "A" in Kashmiri script:', options: ['ا', 'ب', 'ج', 'د'], correct: 0 },
    { id: 202, complexity: 2, category: 'reading_writing', skill: 'reading', text: 'Identify "Pan" (Leaf):', options: ['پَن', 'تَن', 'مَن', 'لَن'], correct: 0 },
    { id: 203, complexity: 5, category: 'reading_writing', skill: 'reading', text: 'Read: "کٲشُر"', options: ['Kashruk', 'Koshur', 'Kashir', 'Kashmir'], correct: 1 },
    { id: 204, complexity: 6, category: 'reading_writing', skill: 'writing', text: 'Correct spelling for "School":', options: ['سکول', 'اسکول', 'سوکول', 'سکال'], correct: 0 },
    { id: 205, complexity: 3, category: 'reading_writing', skill: 'reading', text: 'Which letter is "Tse"?', options: ['ژ', 'چ', 'ج', 'خ'], correct: 0 },
    { id: 206, complexity: 8, category: 'reading_writing', skill: 'reading', text: 'Vowel mark for "Ö" sound:', options: ['Zer', 'Zabar', 'pesh', 'None'], correct: 1 },
    { id: 207, complexity: 4, category: 'reading_writing', skill: 'reading', text: 'Read "آب" :', options: ['Aab', 'Sab', 'Tab', 'Kab'], correct: 0 },
    { id: 208, complexity: 7, category: 'reading_writing', skill: 'writing', text: 'Write "Garr" (Home):', options: ['گَر', 'گھر', 'گرٕ', 'گار'], correct: 2 },
    { id: 209, complexity: 9, category: 'reading_writing', skill: 'reading', text: 'Distinguish "R" (ر) vs "D" (ڑ):', options: ['Shape', 'Dot position', 'No difference', 'Sound only'], correct: 1 },
    { id: 210, complexity: 10, category: 'reading_writing', skill: 'reading', text: 'Classic script style used in Kashmir:', options: ['Nastaliq', 'Naskh', 'Kufic', 'Thuluth'], correct: 0 },

    // --- GRAMMAR / VOCABULARY ---
    { id: 301, complexity: 1, category: 'grammar_vocabulary', skill: 'vocabulary', text: 'Word for "Cat":', options: ['Broor', 'Hoon', 'Gurr', 'Khar'], correct: 0 },
    { id: 302, complexity: 2, category: 'grammar_vocabulary', skill: 'grammar', text: 'Plural of "Hoon" (Dog):', options: ['Hoon', 'Hooni', 'Hoons', 'Hoonan'], correct: 1 },
    { id: 303, complexity: 5, category: 'grammar_vocabulary', skill: 'grammar', text: 'Past tense marker (masculine singular):', options: ['-ov', '-yi', '-as', '-an'], correct: 0 },
    { id: 304, complexity: 6, category: 'grammar_vocabulary', skill: 'grammar', text: '"Su chuh" means:', options: ['He is', 'She is', 'It is', 'They are'], correct: 0 },
    { id: 305, complexity: 3, category: 'grammar_vocabulary', skill: 'vocabulary', text: 'Opposite of "Nyeber" (Outside):', options: ['Andar', 'Peth', 'Bon', 'Pat'], correct: 0 },
    { id: 306, complexity: 7, category: 'grammar_vocabulary', skill: 'grammar', text: 'Ergative Case marker (Agentive):', options: ['-an', '-us', '-as', '-uk'], correct: 0 },
    { id: 307, complexity: 4, category: 'grammar_vocabulary', skill: 'grammar', text: '"Yath" uses which case?', options: ['Dative', 'Nominative', 'Genitive', 'Ablative'], correct: 0 },
    { id: 308, complexity: 8, category: 'grammar_vocabulary', skill: 'grammar', text: 'Conjunction "Magar":', options: ['But', 'And', 'Or', 'So'], correct: 0 },
    { id: 309, complexity: 9, category: 'grammar_vocabulary', skill: 'grammar', text: 'Complex Verb: "Par-an-aav-un" (To teach/cause to read):', options: ['Causative', 'Passive', 'Active', 'Reflexive'], correct: 0 },
    { id: 310, complexity: 10, category: 'grammar_vocabulary', skill: 'vocabulary', text: 'Proverb meaning: "Dour Pohol"?', options: ['Distant shepherd (useless)', 'Strong leader', 'Rich man', 'Lost sheep'], correct: 0 },
];

export default function DiagnosticTest() {
    const router = useRouter();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [qIndex, setQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [loading, setLoading] = useState(true);
    const pointsRef = React.useRef<Record<string, number>>({});

    useEffect(() => {
        const loadQuestions = () => {
            let selections = {
                speaking: 'none',
                reading_writing: 'none',
                grammar_vocabulary: 'none'
            };

            const storedSelections = localStorage.getItem('hechun_guest_skills_selection');
            if (storedSelections) {
                try {
                    selections = JSON.parse(storedSelections);
                } catch (e) { }
            }

            const getRange = (level: string) => {
                if (level === 'fluent') return [7, 10];
                if (level === 'intermediate') return [4, 6];
                // none or beginner
                return [1, 4];
            };

            const categories: QuestionCategory[] = ['speaking', 'reading_writing', 'grammar_vocabulary'];
            let finalSet: Question[] = [];

            categories.forEach(cat => {
                // @ts-ignore
                const level = selections[cat] || 'none';
                const [min, max] = getRange(level);

                const pool = QUESTION_POOL
                    .filter(q => q.category === cat && q.complexity >= min && q.complexity <= max)
                    .sort(() => 0.5 - Math.random()) // Shuffle pool
                    .slice(0, 5); // Take 5

                finalSet = [...finalSet, ...pool];
            });

            // Fallback if empty (shouldn't happen with full pool)
            if (finalSet.length === 0) {
                finalSet = QUESTION_POOL.slice(0, 15);
            }

            // Shuffle Final Set
            setQuestions(finalSet.sort(() => 0.5 - Math.random()));
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

            // Weighted Points
            let points = 1;
            if (currentQ.complexity >= 7) points = 4;
            else if (currentQ.complexity > 4) points = 2;

            // Direct Skill Mapping from Question Metadata
            const earned = pointsRef.current;
            const skill = currentQ.skill; // Direct skill from question

            if (skill) {
                earned[skill] = (earned[skill] || 0) + points;
            } else {
                // Fallback (should not happen with updated pool)
                earned.vocabulary = (earned.vocabulary || 0) + points;
            }
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

        // Update Guest Skills (No XP)
        if (typeof window !== 'undefined') {
            const existingSkillsStr = localStorage.getItem('hechun_guest_skills');
            let skills = existingSkillsStr
                ? JSON.parse(existingSkillsStr)
                : { reading: 0, speaking: 0, grammar: 0, writing: 0, vocabulary: 0, culture: 0 };

            const earned = pointsRef.current;
            Object.keys(earned).forEach(key => {
                skills[key] = (skills[key] || 0) + earned[key];
            });

            localStorage.setItem('hechun_guest_skills', JSON.stringify(skills));
        }

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
                                    {/* Hide complexity for user, maybe show Category? */}
                                    <span className="uppercase tracking-wider text-xs font-bold bg-muted px-2 py-1 rounded">
                                        {currentQ.category.replace('_', ' & ')}
                                    </span>
                                </div>

                                <h2 className="text-2xl font-bold leading-relaxed text-card-foreground mb-8">{currentQ.text}</h2>

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
                                            <span className="text-kashmiri">{opt}</span>
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
