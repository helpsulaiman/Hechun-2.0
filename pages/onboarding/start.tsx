import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Sparkles, BookOpen, Mic, PenTool } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import Layout from '../../components/Layout';
import ThemeImage from '../../components/ThemeImage';
import { SkillLevel, SKILL_LEVELS, SkillProfile } from '../../types/hechun';

const STEPS = [
    {
        id: 'intro',
        title: 'Welcome to Hečhun.',
        subtitle: "Let's personalize your Kashmiri learning path. It only takes a minute.",
        icon: (
            <div className="w-32 h-32 relative animate-float">
                <ThemeImage
                    srcLight="/hechun_logo/hechun_full_lm.png"
                    srcDark="/hechun_logo/hechun_full_dm.png"
                    alt="Hechun Logo"
                    width={400}
                    height={400}
                    className="object-contain w-full h-full drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                />
            </div>
        ),
    },
    {
        id: 'speaking',
        title: 'How is your Speaking?',
        subtitle: 'Can you hold a conversation in Kashmiri?',
        icon: <Mic className="w-12 h-12 text-blue-400" />,
        field: 'speaking' as const,
    },
    {
        id: 'reading_writing',
        title: 'Reading & Writing?',
        subtitle: 'Can you read and write the Perso-Arabic script?',
        icon: <BookOpen className="w-12 h-12 text-green-400" />,
        field: 'reading_writing' as const,
    },
    {
        id: 'grammar_vocabulary',
        title: 'Grammar & Vocabulary?',
        subtitle: 'How is your grasp of grammar rules and words?',
        icon: <Sparkles className="w-12 h-12 text-purple-400" />,
        field: 'grammar_vocabulary' as const,
    },
];

export default function OnboardingStart() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth0();
    const upsertUser = useMutation(api.users.upsertUser);

    const [currentStep, setCurrentStep] = useState(0);
    const [skillsSelection, setSkillsSelection] = useState<{
        speaking: SkillLevel | null;
        reading_writing: SkillLevel | null;
        grammar_vocabulary: SkillLevel | null;
    }>({
        speaking: null,
        reading_writing: null,
        grammar_vocabulary: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleNext = () => {
        if (isTransitioning) return;
        const field = STEPS[currentStep].field;
        if (field && !skillsSelection[field]) {
            return;
        }

        if (currentStep < STEPS.length - 1) {
            setCurrentStep(c => c + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSelect = (level: SkillLevel) => {
        if (isTransitioning) return;

        const field = STEPS[currentStep].field;
        if (field) {
            setSkillsSelection(prev => ({ ...prev, [field]: level }));
            setIsTransitioning(true);

            setTimeout(() => {
                if (currentStep < STEPS.length - 1) {
                    setCurrentStep(c => Math.min(c + 1, STEPS.length - 1));
                    setIsTransitioning(false);
                } else {
                    handleSubmit();
                }
            }, 300);
        }
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            if (isAuthenticated && user) {
                // Wait for user to be created before updating (retry logic)
                let retries = 10;
                let success = false;

                while (retries > 0 && !success) {
                    try {
                        await upsertUser({
                            user_id: user.sub!,
                            skill_vector: {
                                reading_writing: 0,
                                speaking: 0,
                                grammar: 0,
                                vocabulary: 0,
                            },
                        });
                        success = true;
                    } catch (error: any) {
                        if (error.message?.includes("User not found")) {
                            retries--;
                            if (retries > 0) {
                                await new Promise(resolve => setTimeout(resolve, 500));
                            } else {
                                throw new Error("User creation timed out. Please try logging in again.");
                            }
                        } else {
                            throw error;
                        }
                    }
                }
            } else {
                // Save selection to localStorage for guests
                localStorage.setItem('hechun_guest_skills_selection', JSON.stringify(skillsSelection));
            }

            // Check if user has prior knowledge to determine next step
            const hasPriorKnowledge = Object.values(skillsSelection).some(level => level !== 'none');

            if (hasPriorKnowledge) {
                router.push('/onboarding/diagnostic');
            } else {
                router.push('/');
            }
        } catch (error) {
            console.error('Failed to save profile:', error);
            alert('Failed to save your selections. Please try again.');
            setIsSubmitting(false);
        }
    };

    // Safe access with bounds check
    const stepData = STEPS[Math.min(currentStep, STEPS.length - 1)] || STEPS[0];

    // Double guard for render
    if (!stepData) return null;

    return (
        <Layout title="Get Started | Hečhun">
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <div className="w-full max-w-2xl">
                    {/* Progress Bar */}
                    <div className="mb-8 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-indigo-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentStep) / (STEPS.length - 1)) * 100}% ` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-card/80 backdrop-blur-lg border border-border rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
                        >
                            {/* Background Glow */}
                            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

                            <div className="relative z-10 text-center">
                                <div className="flex justify-center mb-6">
                                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md shadow-inner">
                                        {stepData.icon}
                                    </div>
                                </div>

                                <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                                    {stepData.title}
                                </h1>
                                <p className="text-xl text-muted-foreground mb-10 max-w-lg mx-auto">
                                    {stepData.subtitle}
                                </p>

                                {stepData.id === 'intro' ? (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleNext}
                                        disabled={isTransitioning}
                                        className="px-8 py-4 bg-primary text-primary-foreground text-lg font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto disabled:opacity-50"
                                    >
                                        Start Assessment <ArrowRight className="w-5 h-5" />
                                    </motion.button>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {SKILL_LEVELS.map((level) => (
                                            <motion.button
                                                key={level.id}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleSelect(level.id)}
                                                disabled={isTransitioning}
                                                className={`p-6 rounded-2xl border text-left transition-all group
                                                    ${skillsSelection[stepData.field!] === level.id
                                                        ? 'border-primary bg-primary/10'
                                                        : 'border-border bg-card/50 hover:bg-muted/50'
                                                    }
                                                    disabled:opacity-50 disabled:cursor-not-allowed
                                                `}
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className={`font-bold text-lg ${skillsSelection[stepData.field!] === level.id ? 'text-primary' : 'text-foreground'} `}>
                                                        {level.label}
                                                    </span>
                                                    {skillsSelection[stepData.field!] === level.id && (
                                                        <Check className="w-5 h-5 text-primary" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                                    {level.description}
                                                </p>
                                            </motion.button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Back Button */}
                    {currentStep > 0 && (
                        <button
                            onClick={() => {
                                if (!isTransitioning) setCurrentStep(c => Math.max(0, c - 1));
                            }}
                            disabled={isTransitioning}
                            className="mt-6 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 mx-auto disabled:opacity-50"
                        >
                            Back
                        </button>
                    )}
                </div>
            </div>
        </Layout>
    );
}
