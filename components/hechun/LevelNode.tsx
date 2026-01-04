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
                href={isLocked ? '#' : `/hechun/lesson/${lesson.id}`}
                className={`${styles.levelNode} ${styles[status]}`}
            >
                <div className={styles.nodeContent}>
                    {isLocked ? (
                        <i className="fas fa-lock text-xl opacity-50" />
                    ) : (
                        <>
                            <span className={styles.lessonOrder}>{lesson.lesson_order}</span>
                            <div className={styles.starContainer}>
                                {[1, 2, 3].map((star) => (
                                    <i
                                        key={star}
                                        className={`fas fa-star ${star <= (lesson.user_stars || 0) ? styles.starFilled : styles.starEmpty
                                            }`}
                                    />
                                ))}
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
