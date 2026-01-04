import React, { useState } from 'react';
import Head from 'next/head';
import styles from '../../styles/learn.module.css';
import Layout from '../../components/Layout';
import { createClient } from '@supabase/supabase-js';

export interface LessonExercise {
    id: number;
    type: 'mcq' | 'translate';
    prompt: string;
    kashmiri: string;
    transliteration: string;
    english: string;
    choices?: string[];
    answer: string;
}

// Define props for the page
interface LearnPageProps {
    exercises: LessonExercise[];
}

// This function runs on the server at build time to fetch data
export async function getStaticProps() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!
    );

    const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error('Error fetching lesson data:', error);
    }

    return {
        props: {
            exercises: data || [],
        },
        revalidate: 60,
    };
}

const LearnPage: React.FC<LearnPageProps> = ({ exercises }) => {
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
    const [userInput, setUserInput] = useState('');
    const [sessionStatus, setSessionStatus] = useState<'answering' | 'checked'>('answering');
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    if (!exercises || exercises.length === 0) {
        return (
            <Layout title="Kashmiri Lesson">
                <p className="text-center p-8">Loading sentence lessons...</p>
            </Layout>
        );
    }


    const currentExercise = exercises[currentExerciseIndex];
    const progressPercentage = ((currentExerciseIndex + 1) / exercises.length) * 100;

    const resetState = () => {
        setCurrentExerciseIndex(0);
        setSessionStatus('answering');
        setIsCorrect(null);
        setSelectedChoice(null);
        setUserInput('');
    };

    const handleCheckAnswer = () => {
        if (sessionStatus !== 'answering') return;
        let correct = false;
        if (currentExercise.type === 'mcq') {
            correct = selectedChoice === currentExercise.answer;
        } else if (currentExercise.type === 'translate') {
            // UPDATED: Check against the English answer
            correct = userInput.trim().toLowerCase() === currentExercise.english.trim().toLowerCase();
        }
        setIsCorrect(correct);
        setSessionStatus('checked');
    };

    const handleContinue = () => {
        if (currentExerciseIndex < exercises.length - 1) {
            setCurrentExerciseIndex(currentExerciseIndex + 1);
            setSessionStatus('answering');
            setIsCorrect(null);
            setSelectedChoice(null);
            setUserInput('');
        } else {
            alert("Congratulations, you've completed the lesson!");
        }
    };

    const handleRestart = () => {
        if (window.confirm("Are you sure you want to restart the lesson?")) {
            resetState();
        }
    };

    const getButtonText = () => {
        if (sessionStatus === 'answering') return 'Check';
        if (currentExerciseIndex === exercises.length - 1) return 'Finish Lesson';
        return 'Continue';
    };

    const getChoiceClass = (choice: string) => {
        let classNames = [styles.mcqOption];
        const isSelected = selectedChoice === choice;
        if (sessionStatus === 'checked') {
            if (choice === currentExercise.answer) classNames.push(styles.correct);
            if (isSelected && choice !== currentExercise.answer) classNames.push(styles.incorrect);
        } else if (isSelected) {
            classNames.push(styles.selected);
        }
        return classNames.join(' ');
    };

    const getActionButtonClass = () => {
        if (sessionStatus === 'answering') return styles.check;
        return isCorrect ? styles.correct : styles.incorrect;
    };

    return (
        <Layout title="Kashmiri Lesson">
            <div className={styles.learnContainer}>
                <div className={styles.lessonHeader}>
                    <h1 className={styles.lessonTitle}>Kashmiri Lesson</h1>
                    {/* NEW: Added Restart button */}
                    <button onClick={handleRestart} className={styles.restartButton}>
                        Restart Lesson
                    </button>
                </div>

                <div className={styles.progressBarContainer}>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${progressPercentage}%` }} />
                    </div>
                </div>


                <main className={styles.mainContent}>
                    <div className={styles.lessonWrapper}>
                        <div className={styles.lessonCard}>
                            <h2 className={styles.promptText}>{currentExercise.prompt}</h2>
                            <p className={styles.sentenceText} lang="ks">
                                {/* UPDATED: Always show the Kashmiri sentence */}
                                {currentExercise.kashmiri}
                            </p>

                            <p className={styles.transliterationText}>
                                {currentExercise.transliteration}
                            </p>

                            {currentExercise.type === 'mcq' ? (
                                <div className="space-y-4">
                                    {currentExercise.choices?.map((choice) => (
                                        <button
                                            key={choice}
                                            onClick={() => setSelectedChoice(choice)}
                                            disabled={sessionStatus === 'checked'}
                                            className={getChoiceClass(choice)}
                                        >
                                            {choice}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <textarea
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    disabled={sessionStatus === 'checked'}
                                    // UPDATED: Placeholder for English
                                    placeholder="Type in English..."
                                    className="w-90% p-4 border rounded-lg focus:ring-2 transition form-textarea text-xl"
                                    rows={4}
                                    style={{ borderColor: 'var(--border-color)' }}
                                />
                            )}
                        </div>
                    </div>
                </main>

                <footer className={styles.footer}>
                    <div className="max-w-xl mx-auto">
                        {sessionStatus === 'checked' && (
                            <div className={`${styles.feedbackArea} ${isCorrect ? styles.correct : styles.incorrect}`}>
                                <h3>{isCorrect ? 'Excellent!' : 'That\'s not quite right.'}</h3>
                                {/* UPDATED: Show the English answer on incorrect */}
                                {!isCorrect && <p className="text-lg mt-1">Answer: <strong>{currentExercise.english}</strong></p>}
                            </div>
                        )}
                        <button
                            onClick={sessionStatus === 'answering' ? handleCheckAnswer : handleContinue}
                            className={`${styles.actionButton} ${getActionButtonClass()}`}
                        >
                            {getButtonText()}
                        </button>
                    </div>
                </footer>
            </div>
        </Layout>
    );
};

export default LearnPage;