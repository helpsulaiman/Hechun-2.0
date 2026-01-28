import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
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
// --- SPEAKING (Expanded) ---
// --- SPEAKING (Expanded & Randomized) ---
const QUESTION_POOL: Question[] = [
    { id: 101, complexity: 1, category: 'speaking', skill: 'speaking', text: 'How do you say "Hello"?', options: ['Kyah', 'Salam', 'Na', 'Awa'], correct: 1 },
    { id: 102, complexity: 5, category: 'speaking', skill: 'speaking', text: 'Response to "Tuhey kyah chiv karan?"', options: ['Bi chus gatshan', 'Awa', 'Salam', 'Bi chus parān'], correct: 3 },
    { id: 103, complexity: 8, category: 'speaking', skill: 'speaking', text: 'Nuance: "Hata!" is used for?', options: ['Respectful address', 'Calling a female', 'While Studying', 'Calling a male friend (informal)'], correct: 3 },
    { id: 104, complexity: 3, category: 'speaking', skill: 'speaking', text: '"Tohi chiv varaay?" means:', options: ['Who are you?', 'Where is it?', 'Are you well?', 'Come here'], correct: 2 },
    { id: 105, complexity: 6, category: 'speaking', skill: 'speaking', text: 'Formal way to say "Sit down":', options: ['Beh', 'Tul', 'Behiv', 'Gats'], correct: 2 },
    { id: 106, complexity: 2, category: 'speaking', skill: 'speaking', text: 'Saying "Thank you":', options: ['Salam', 'Bas', 'Adab', 'Shukriya'], correct: 3 },
    { id: 107, complexity: 9, category: 'speaking', skill: 'speaking', text: 'Correct intonation for "Kyah?" (What?) vs "Kyah!" (Really!):', options: ['Rising vs Falling', 'Falling vs Rising', 'Flat vs High', 'No difference'], correct: 0 },
    { id: 108, complexity: 4, category: 'speaking', skill: 'speaking', text: '"Me lej tresh" expresses:', options: ['Thirst', 'Hunger', 'Pain', 'Joy'], correct: 0 },
    { id: 109, complexity: 7, category: 'speaking', skill: 'speaking', text: 'Saying "I understand":', options: ['Me aav gats', 'Bi chus zanan', 'Me gov maloom', 'Me tor fikri'], correct: 3 },
    { id: 110, complexity: 10, category: 'speaking', skill: 'speaking', text: 'Complex polite command: "Tohi heykiyiv..."', options: ['Are you...', 'You must...', 'Why did you...', 'You could...'], correct: 3 },
    { id: 111, complexity: 2, category: 'speaking', skill: 'speaking', text: 'How to greet an elder respectfully?', options: ['Asalāmu-alaikum', 'Hey', 'Kyah chuh', 'Sun'], correct: 0 },
    { id: 112, complexity: 4, category: 'speaking', skill: 'speaking', text: '"Bi chus theek" means:', options: ['I am sick', 'I am going', 'I am fine', 'I am eating'], correct: 2 },
    { id: 113, complexity: 6, category: 'speaking', skill: 'speaking', text: 'Asking "Where is the way?":', options: ['Garr kati chuh?', 'Su kus chuh?', 'Vath kati che?', 'Kyah gav?'], correct: 2 },
    { id: 114, complexity: 8, category: 'speaking', skill: 'speaking', text: 'Which implies urgency?', options: ['Val', 'Jaldi kar!', 'Ruksa', 'Pakaan'], correct: 1 },
    { id: 115, complexity: 5, category: 'speaking', skill: 'speaking', text: 'Saying goodbye:', options: ['Salam', 'Awa', 'Khuda Haafiz', 'Na'], correct: 2 },

    // --- READING / WRITING (Expanded & Randomized) ---
    { id: 201, complexity: 1, category: 'reading_writing', skill: 'reading', text: 'Letter "A" in Kashmiri script:', options: ['ب', 'ا', 'ج', 'د'], correct: 1 },
    { id: 202, complexity: 2, category: 'reading_writing', skill: 'reading', text: 'Identify "Pan" (Leaf):', options: ['پَن', 'تَن', 'مَن', 'لَن'], correct: 0 },
    { id: 203, complexity: 5, category: 'reading_writing', skill: 'reading', text: 'Read: "کٲشُر"', options: ['Kashruk', 'Konder', 'Kashir', 'Koshur'], correct: 3 },
    { id: 204, complexity: 6, category: 'reading_writing', skill: 'writing', text: 'Correct spelling for "School":', options: ['سکول', 'سوکول', 'سکال', 'اسکول'], correct: 0 },
    { id: 205, complexity: 3, category: 'reading_writing', skill: 'reading', text: 'Which letter is "Tse"?', options: ['چ', 'ج', 'ژ', 'خ'], correct: 2 },
    { id: 206, complexity: 8, category: 'reading_writing', skill: 'reading', text: 'Vowel mark for "Ü" sound:', options: ['Zer', 'Zabar', 'None', 'pesh'], correct: 3 }, // Tricky
    { id: 207, complexity: 4, category: 'reading_writing', skill: 'reading', text: 'Read "آب" :', options: ['Sab', 'Aab', 'Tab', 'Kab'], correct: 1 },
    { id: 208, complexity: 7, category: 'reading_writing', skill: 'writing', text: 'Write "Garr" (Home):', options: ['گَر', 'گھر', 'گرٕ', 'گار'], correct: 2 },
    { id: 209, complexity: 3, category: 'reading_writing', skill: 'reading', text: 'Distinguish "R" (ر) vs "D" (ڑ):', options: ['Shape', 'Dot position', 'All of the above', 'Sound'], correct: 2 },
    { id: 210, complexity: 10, category: 'reading_writing', skill: 'reading', text: 'Classic script style used in Kashmir:', options: ['Nastaliq', 'Naskh', 'Kufic', 'Thuluth'], correct: 0 },
    { id: 211, complexity: 2, category: 'reading_writing', skill: 'reading', text: 'Identify "Naar" (Fire):', options: ['نور', 'نیر', 'تار', 'نار'], correct: 3 },
    { id: 212, complexity: 4, category: 'reading_writing', skill: 'reading', text: 'Letter for "Ch" sound:', options: ['ج', 'ح', 'چ', 'خ'], correct: 2 },
    { id: 213, complexity: 6, category: 'reading_writing', skill: 'writing', text: 'Write "Posh" (Flower):', options: ['پاش', 'پوش', 'فوش', 'بوش'], correct: 1 },
    { id: 214, complexity: 5, category: 'reading_writing', skill: 'reading', text: 'Read "Dood" (Milk):', options: ['دُد', 'داد', 'ڈوڈ', 'دید'], correct: 0 },
    { id: 215, complexity: 3, category: 'reading_writing', skill: 'reading', text: 'Identify numeral 5:', options: ['۶', '۴', '۵', '۷'], correct: 2 },

    // --- GRAMMAR / VOCABULARY (Expanded & Randomized) ---
    { id: 301, complexity: 1, category: 'grammar_vocabulary', skill: 'vocabulary', text: 'Word for "Cat":', options: ['Hoon', 'Gurr', 'Byer', 'Khar'], correct: 2 },
    { id: 302, complexity: 2, category: 'grammar_vocabulary', skill: 'grammar', text: 'Plural of "Hoon" (Dog):', options: ['Hoon', 'Hoonas', 'Hoonis', 'Hoonï'], correct: 3 },
    // { id: 303, complexity: 5, category: 'grammar_vocabulary', skill: 'grammar', text: 'Past tense marker (masculine singular):', options: ['-ov', '-yi', '-as', '-an'], correct: 0 },
    { id: 304, complexity: 6, category: 'grammar_vocabulary', skill: 'grammar', text: '"Su chuh" means:', options: ['She is', 'He is', 'It is', 'They are'], correct: 1 },
    { id: 305, complexity: 3, category: 'grammar_vocabulary', skill: 'vocabulary', text: 'Opposite of "Nyeber" (Outside):', options: ['Peth', 'Bon', 'Andar', 'Pat'], correct: 2 },
    // { id: 306, complexity: 7, category: 'grammar_vocabulary', skill: 'grammar', text: 'Ergative Case marker (Agentive):', options: ['-us', '-an', '-as', '-uk'], correct: 1 },
    { id: 307, complexity: 10, category: 'grammar_vocabulary', skill: 'grammar', text: '"Yath" uses which case?', options: ['Nominative', 'Genitive', 'Ablative', 'Dative'], correct: 3 },
    { id: 308, complexity: 8, category: 'grammar_vocabulary', skill: 'grammar', text: 'Conjunction "Magar":', options: ['And', 'But', 'Or', 'So'], correct: 1 },
    { id: 309, complexity: 9, category: 'grammar_vocabulary', skill: 'grammar', text: 'Complex Verb: "Par-n-aav-un" (To teach/cause to read):', options: ['Passive', 'Active', 'Causative', 'Reflexive'], correct: 2 },
    { id: 310, complexity: 10, category: 'grammar_vocabulary', skill: 'vocabulary', text: 'Proverb meaning: "Boni mohar tulun"?', options: ['Strong leader', 'Rich man', 'Chopping a chinar', 'An impossible task'], correct: 3 },
    { id: 311, complexity: 2, category: 'grammar_vocabulary', skill: 'vocabulary', text: 'Word for "Mother":', options: ['Mouj', 'Beni', 'Koor', 'Zanana'], correct: 0 },
    { id: 312, complexity: 4, category: 'grammar_vocabulary', skill: 'grammar', text: 'Future Tense: "I will go":', options: ['Bi gase', 'Bi goos', 'Bi chus gasan', 'Bi gasan'], correct: 0 },
    { id: 313, complexity: 5, category: 'grammar_vocabulary', skill: 'vocabulary', text: 'Meaning of "khyen":', options: ['Place', 'Person', 'Food', 'Time'], correct: 2 },
    { id: 314, complexity: 3, category: 'grammar_vocabulary', skill: 'grammar', text: 'Possessive "My" (Masculine Object):', options: ['Me', 'Myo', 'Myon', 'Mya'], correct: 2 },
    { id: 315, complexity: 6, category: 'grammar_vocabulary', skill: 'vocabulary', text: 'Word for "Snow":', options: ['Naar', 'Aab', 'Sheen', 'Vaav'], correct: 2 },
];

export default function DiagnosticTest() {
    const router = useRouter();
    const user = useUser();
    const supabase = useSupabaseClient();
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

            // Weighted Points based on Question Complexity Pool
            // User Spec:
            // Pool 1 (Fluent, 7-10): 4 pts
            // Pool 2 (Intermediate, 4-6): 2 pts
            // Pool 3 (Beginner, 1-4): 1 pt

            let points = 1;
            if (currentQ.complexity >= 7) points = 4;
            else if (currentQ.complexity >= 4) points = 2; // Covers 4-6
            else points = 1; // Covers 1-3

            // Direct Skill Mapping from Question Metadata
            const earned = pointsRef.current;
            const skill = currentQ.skill; // Direct skill from question

            if (skill) {
                earned[skill] = (earned[skill] || 0) + points;
                console.log(`Earned ${points} points for ${skill} (Complexity ${currentQ.complexity}). Total: ${earned[skill]}`);
            } else {
                // Fallback
                console.warn('Question missing skill property:', currentQ);
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
        const earned = pointsRef.current;
        console.log('Points Earned in Test:', earned);

        try {
            if (user) {
                // Authenticated User: Save to DB
                console.log('Saving diagnostic results to DB for user:', user.id);
                const res = await fetch('/api/user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'complete_diagnostic',
                        points: earned
                    }),
                });

                if (!res.ok) throw new Error('Failed to save scores');
                console.log('Successfully saved to DB');
            } else {
                // Guest User: Save to LocalStorage
                if (typeof window !== 'undefined') {
                    const existingSkillsStr = localStorage.getItem('hechun_guest_skills');
                    let skills = existingSkillsStr
                        ? JSON.parse(existingSkillsStr)
                        : { reading: 0, speaking: 0, grammar: 0, writing: 0, vocabulary: 0, culture: 0 };

                    console.log('Initial Skills (Before Update):', skills);

                    Object.keys(earned).forEach(key => {
                        skills[key] = (skills[key] || 0) + earned[key];
                    });

                    console.log('Final Skills (Saving):', skills);
                    localStorage.setItem('hechun_guest_skills', JSON.stringify(skills));
                }
            }
        } catch (err) {
            console.error('Error saving diagnostic results:', err);
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
