import React from 'react';
import Link from 'next/link';
import { LearningLesson } from '../../types/learning';

interface LessonNodeProps {
    lesson: LearningLesson;
    isLocked: boolean;
}

const LessonNode: React.FC<LessonNodeProps> = ({ lesson, isLocked }) => {
    // Calculate stars display
    const stars = lesson.user_stars || 0;

    return (
        <div className={`flex flex-col items-center mb-8 relative z-10 ${isLocked ? 'opacity-60 grayscale' : ''}`}>
            <Link
                href={isLocked ? '#' : `/hechun/lesson/${lesson.id}`}
                className={`
          w-20 h-20 rounded-full flex items-center justify-center 
          shadow-lg transition-all transform hover:scale-105
          ${isLocked
                        ? 'bg-gray-200 cursor-not-allowed'
                        : 'bg-gradient-to-b from-chinar-light to-chinar-orange cursor-pointer hover:shadow-xl'
                    }
          border-4 border-white dark:border-gray-800
        `}
                onClick={(e) => isLocked && e.preventDefault()}
            >
                {isLocked ? (
                    <span className="text-2xl">🔒</span>
                ) : (
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-xs uppercase font-bold text-white opacity-80 mb-1">Lesson</span>
                        <span className="text-3xl text-white font-bold">{lesson.lesson_order}</span>
                    </div>
                )}
            </Link>

            {/* Stars Indicator */}
            {!isLocked && (
                <div className="flex gap-1 mt-2">
                    {[1, 2, 3].map((star) => (
                        <span
                            key={star}
                            className={`text-sm ${star <= stars ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                            ★
                        </span>
                    ))}
                </div>
            )}

            <div className="mt-2 text-center">
                <h3 className="font-bold text-gray-800 dark:text-gray-200">{lesson.title}</h3>
                {lesson.description && (
                    <p className="text-xs text-gray-500 max-w-[150px]">{lesson.description}</p>
                )}
            </div>
        </div>
    );
};

export default LessonNode;
