import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth0 } from '@auth0/auth0-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import Layout from '../../../components/Layout';
import { LearningLesson, LessonStep } from '../../../types/learning';
import { ArrowLeft, CheckCircle, PlayCircle, BookOpen, Sparkles, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PhoneticLesson from '../../../components/lesson/PhoneticLesson';
import DialogueLesson from '../../../components/lesson/DialogueLesson';
import ListLesson from '../../../components/lesson/ListLesson';
import TeachStep from '../../../components/lesson/TeachStep';
import QuizStep from '../../../components/lesson/QuizStep';
import InputStep from '../../../components/lesson/InputStep';

export default function LessonPlayer() {
    const router = useRouter();
    const { skill, order } = router.query;
    const { user, isLoading: authLoading } = useAuth0();

    const lessonOrder = order ? parseInt(order as string) : null;
    const skillType = skill as "reading_writing" | "speaking" | "grammar" | "vocabulary" | undefined;

    // Fetch lesson from skill-specific table
    const lesson = useQuery(
        api.lessons_new.getLessonBySkillAndOrder,
        lessonOrder !== null && skillType
            ? { skill: skillType, lessonOrder }
            : "skip"
    );

    // Mutation to submit lesson with skill-based tracking
    const submitLessonMutation = useMutation(api.progress_new.submitLesson);

    const [submitting, setSubmitting] = useState(false);
    const [showSparkle, setShowSparkle] = useState(false);
    const [progress, setProgress] = useState(0);
    const [stepIndex, setStepIndex] = useState(0);
    const [canAdvance, setCanAdvance] = useState(false);
    const [showTransliteration, setShowTransliteration] = useState(true);

    const loading = authLoading || lesson === undefined;
    const steps = !loading && lesson ? (lesson.content?.steps || lesson.content as any) : null;
    const currentStep = steps?.[stepIndex] || null;

    // Auto-enable continue for teach steps (must be before conditional returns)
    useEffect(() => {
        if (currentStep?.type === 'teach' && !canAdvance) {
            const timer = setTimeout(() => setCanAdvance(true), 100);
            return () => clearTimeout(timer);
        }
    }, [currentStep, canAdvance]);

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
            </Layout>
        )
    }

    if (!lesson || !skillType) {
        return (
            <Layout>
                <div className="max-w-2xl mx-auto p-8 text-center">
                    <h1 className="text-2xl font-bold mb-4">Lesson Not Found</h1>
                    <p className="text-muted-foreground mb-6">
                        We couldn't find the lesson you're looking for.
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="btn btn-primary"
                    >
                        Return to Homepage
                    </button>
                </div>
            </Layout>
        );
    }

    // Convert lesson to LearningLesson format if needed
    const learningLesson: LearningLesson = {
        id: lesson.lesson_order,
        lesson_order: lesson.lesson_order,
        title: lesson.title,
        description: lesson.description ?? null,
        content: lesson.content,
        complexity: lesson.complexity,
        xp_reward: lesson.xp_reward,
        skills_targeted: { [skillType]: 1.0 }, // Primary skill
        user_score: 1.0,
        is_locked: false,
        is_completed: false,
        times_completed: 0,
    };

    const handleCompleteLesson = async (score: number) => {
        if (submitting || !user) return;

        setSubmitting(true);
        setShowSparkle(true);

        try {
            // Calculate skill points (2 per quiz, 1 per teach)
            let skillPoints = 0;

            if (Array.isArray(steps)) {
                skillPoints = steps.reduce((total: number, step: any) => {
                    if (step.type === 'quiz' || step.type === 'quiz_multiple_choice') return total + 2;
                    if (step.type === 'teach') return total + 1;
                    return total;
                }, 0);
            } else {
                // For non-step lessons (Phonetic, Dialogue, List), award fixed points
                skillPoints = 5; // Default value for completing a special lesson
            }

            await submitLessonMutation({
                userId: user.sub!,
                skill: skillType,
                lessonOrder: lesson.lesson_order,
                score,
                skillPointsEarned: skillPoints,
                xpEarned: lesson.xp_reward,
            });

            // Redirect after short delay
            setTimeout(() => {
                router.push('/');
            }, 2000);
        } catch (error) {
            console.error('Error submitting lesson:', error);
            setSubmitting(false);
            setShowSparkle(false);
        }
    };

    const isLastStep = stepIndex === (steps?.length || 0) - 1;

    const handleNext = () => {
        if (isLastStep && canAdvance) {
            handleCompleteLesson(1.0); // Full score for completing all steps
        } else if (canAdvance && stepIndex < (steps?.length || 0) - 1) {
            setStepIndex(stepIndex + 1);
            setCanAdvance(false);
            setProgress(((stepIndex + 2) / (steps?.length || 1)) * 100);
        }
    };

    const handleBack = () => {
        if (stepIndex > 0) {
            setStepIndex(stepIndex - 1);
            setProgress(((stepIndex) / (steps?.length || 1)) * 100);
        } else {
            router.push('/');
        }
    };

    // Render special lesson types
    if (learningLesson.content?.type === 'phonetic') {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto py-8 px-4">
                    <div className="mb-6 flex justify-between items-center">
                        <button
                            onClick={() => router.push('/')}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to Home
                        </button>
                        <h1 className="text-2xl font-bold">{learningLesson.title}</h1>
                    </div>

                    <PhoneticLesson
                        content={learningLesson.content}
                        onComplete={() => handleCompleteLesson(1.0)}
                    />

                    <div className="mt-12 flex justify-end">
                        <button
                            onClick={() => handleCompleteLesson(1.0)}
                            disabled={submitting}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            {submitting ? 'Completing...' : 'Complete Lesson'}
                            <CheckCircle className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    if (learningLesson.content?.type === 'dialogue') {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto py-8 px-4">
                    <div className="mb-6 flex justify-between items-center">
                        <button
                            onClick={() => router.push('/')}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to Home
                        </button>
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold">{learningLesson.title}</h1>
                            <button
                                onClick={() => setShowTransliteration(!showTransliteration)}
                                className="p-2 rounded-lg hover:bg-muted transition-colors"
                                title={showTransliteration ? "Hide transliteration" : "Show transliteration"}
                            >
                                {showTransliteration ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <DialogueLesson
                        content={learningLesson.content}
                        showTransliteration={showTransliteration}
                    />

                    <div className="mt-12 flex justify-end">
                        <button
                            onClick={() => handleCompleteLesson(1.0)}
                            disabled={submitting}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            {submitting ? 'Completing...' : 'Complete Lesson'}
                            <CheckCircle className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    if (learningLesson.content?.type === 'list') {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto py-8 px-4">
                    <div className="mb-6 flex justify-between items-center">
                        <button
                            onClick={() => router.push('/')}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to Home
                        </button>
                        <h1 className="text-2xl font-bold">{learningLesson.title}</h1>
                    </div>

                    <ListLesson
                        content={learningLesson.content}
                    />

                    <div className="mt-12 flex justify-end">
                        <button
                            onClick={() => handleCompleteLesson(1.0)}
                            disabled={submitting}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            {submitting ? 'Completing...' : 'Complete Lesson'}
                            <CheckCircle className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    // Structured lesson (step-by-step)
    return (
        <Layout>
            <div className="max-w-4xl mx-auto py-8 px-4">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        {stepIndex === 0 ? 'Back to Home' : 'Previous'}
                    </button>

                    {/* Progress Bar */}
                    <div className="bg-muted rounded-full h-3 overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-primary to-purple-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                    </div>

                    <div className="flex justify-between items-center mt-4">
                        <div>
                            <h1 className="text-2xl font-bold">{learningLesson.title}</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Step {stepIndex + 1} of {steps?.length || 0}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold px-3 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full">
                                {skillType.replace('_', ' & ')}
                            </span>
                            <button
                                onClick={() => setShowTransliteration(!showTransliteration)}
                                className="p-2 rounded-lg hover:bg-muted transition-colors"
                                title={showTransliteration ? "Hide transliteration" : "Show transliteration"}
                            >
                                {showTransliteration ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={stepIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {currentStep?.type === 'teach' && currentStep.content && (
                            <TeachStep
                                content={currentStep.content}
                                showTransliteration={showTransliteration}
                            />
                        )}

                        {(currentStep?.type === 'quiz' || currentStep?.type === 'quiz_multiple_choice') && currentStep.content && (
                            <QuizStep
                                content={currentStep.content}
                                showTransliteration={showTransliteration}
                                onComplete={(success) => success && setCanAdvance(true)}
                            />
                        )}

                        {currentStep?.type === 'input' && currentStep.content && (
                            <InputStep
                                content={currentStep.content}
                                showTransliteration={showTransliteration}
                                onComplete={(success) => success && setCanAdvance(true)}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleNext}
                        disabled={!canAdvance || submitting}
                        className={`btn ${canAdvance ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'} flex items-center gap-2`}
                    >
                        {isLastStep ? (
                            <>
                                {submitting ? 'Completing...' : 'Complete Lesson'}
                                <CheckCircle className="w-5 h-5" />
                            </>
                        ) : (
                            <>
                                Continue
                                <ChevronRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>

                {/* Completion Sparkle */}
                {showSparkle && (
                    <motion.div
                        className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Sparkles className="w-32 h-32 text-yellow-400" />
                    </motion.div>
                )}
            </div>
        </Layout>
    );
}
