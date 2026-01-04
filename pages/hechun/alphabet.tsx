import React, { useState } from 'react';
import Layout from '../../components/Layout';
import Link from 'next/link';
import styles from '../../styles/Alphabet.module.css';
import { createClient } from '@supabase/supabase-js'; // Import Supabase client

// Define the type for the data coming from Supabase
interface AlphabetLesson {
    id: number;
    letter: string;
    name: string;
    pronunciation: string;
    example_word_kashmiri: string;
    example_word_english: string;
}

// Define the props for the page component
interface AlphabetPageProps {
    alphabetData: AlphabetLesson[];
}

// This function runs on the server at build time to fetch data
export async function getStaticProps() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY! // Use the secure service key on the server
    );

    const { data, error } = await supabase
        .from('alphabet')
        .select('*')
        .order('lesson_order', { ascending: true });

    if (error) {
        console.error('Error fetching alphabet data:', error);
    }

    return {
        props: {
            alphabetData: data || [],
        },
        // Optional: re-fetch the data every 60 seconds to check for updates
    };
}

const KashmiriAlphabetPage: React.FC<AlphabetPageProps> = ({ alphabetData }) => {
    const [currentLetterIndex, setCurrentLetterIndex] = useState(0);

    // Handle case where data is not yet loaded or is empty
    if (!alphabetData || alphabetData.length === 0) {
        return <Layout><p className="text-center p-8">Loading alphabet lessons...</p></Layout>;
    }

    const currentLesson = alphabetData[currentLetterIndex];

    const handleNext = () => {
        if (currentLetterIndex < alphabetData.length - 1) {
            setCurrentLetterIndex(currentLetterIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentLetterIndex > 0) {
            setCurrentLetterIndex(currentLetterIndex - 1);
        }
    };

    const playSound = (sound: string) => {
        console.log(`Playing sound for: ${sound}`);
    };

    const progressPercentage = ((currentLetterIndex + 1) / alphabetData.length) * 100;

    return (
        <Layout>
            <div className={styles.pageContainer}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Hečhun</h1>
                    <p className={styles.pageSubtitle}>
                        Click through the letters to learn their names and sounds.
                    </p>


                </div>

                <div className={styles.progressBarContainer}>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${progressPercentage}%` }} />
                    </div>
                    <p className={styles.progressText}>
                        Letter {currentLetterIndex + 1} of {alphabetData.length}
                    </p>
                </div>

                <div className={styles.flashcard}>
                    <div className={styles.letterColumn}>
                        <h2 className={styles.letterName}>{currentLesson.name}</h2>
                        <div className={styles.letterDisplay} lang="ks">
                            {currentLesson.letter}
                        </div>
                        <button
                            onClick={() => playSound(currentLesson.name)}
                            className={styles.soundButton}
                            aria-label={`Play sound for ${currentLesson.name}`}
                        >
                            🔊
                        </button>
                    </div>

                    <div className={styles.exampleColumn}>
                        <h3 className={styles.exampleHeader}>Pronunciation & Example</h3>
                        <p className={styles.pronunciationText}>
                            Sounds like: &quot;{currentLesson.pronunciation}&quot;
                        </p>
                        <div className={styles.exampleWordContainer}>
                            <div>
                                <span className={styles.exampleWordKashmiri} lang="ks">
                                    {currentLesson.example_word_kashmiri}
                                </span>
                                <button
                                    onClick={() => playSound(currentLesson.example_word_kashmiri)}
                                    className={styles.soundButton}
                                    aria-label={`Play sound for ${currentLesson.example_word_kashmiri}`}
                                >
                                    🔊
                                </button>
                            </div>
                            <p className={styles.exampleWordEnglish}>is &quot;{currentLesson.example_word_english}&quot;</p>
                        </div>
                    </div>
                </div>

                <div className={styles.navigation}>
                    <button
                        onClick={handlePrevious}
                        disabled={currentLetterIndex === 0}
                        className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ← Previous
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={currentLetterIndex === alphabetData.length - 1}
                        className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next →
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default KashmiriAlphabetPage;