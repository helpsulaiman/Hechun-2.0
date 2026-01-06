import React from 'react';
import Link from 'next/link';
import { LearningLesson } from '../../types/learning';
import styles from '../../styles/learn.module.css';

interface LevelNodeProps {
    lesson: LearningLesson;
    status: 'locked' | 'unlocked' | 'completed';
    position: 'left' | 'right' | 'center';
    index: number;
}

const LevelNode: React.FC<LevelNodeProps> = ({ lesson, status, position, index }) => {
    const isLocked = status === 'locked';

    return (
        <div className={`${styles.nodeWrapper} ${styles[position]}`} style={{ '--i': index } as any}>
            <Link
                href={isLocked ? '#' : `/lesson/${lesson.id}`}
                className={`${styles.levelNode} ${styles[status]}`}
            >
                <div className={styles.nodeContent}>
                    {isLocked ? (
                        <i className="fas fa-lock text-xl opacity-50" />
                    ) : (
                        <>
                            <span className={styles.lessonOrder}>Lesson {lesson.lesson_order}</span>
                            <div className={styles.starContainer}>
                                {[1, 2, 3].map((star) => {
                                    // Calculate stars based on score (0.0 - 1.0)
                                    // 0.6 = 1 star, 0.8 = 2 stars, 1.0 = 3 stars
                                    const score = lesson.user_score || 0;
                                    const starsEarned = score >= 0.99 ? 3 : score >= 0.8 ? 2 : score >= 0.6 ? 1 : 0;

                                    return (
                                        <i
                                            key={star}
                                            className={`fas fa-star ${star <= starsEarned ? styles.starFilled : styles.starEmpty
                                                }`}
                                        />
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </Link>
            {!isLocked && (
                <div className={styles.nodeLabel}>
                    <span className={styles.lessonTitle}>{lesson.title}</span>
                </div>
            )}
        </div>
    );
};

export default LevelNode;
