export interface LearningLevel {
    id: number;
    name: string;
    description: string | null;
    level_order: number;
    min_stars_required: number;
    created_at: string;
    // Joined fields
    lessons?: LearningLesson[];
    is_locked?: boolean;
}

export interface LearningLesson {
    id: number;
    level_id: number;
    title: string;
    description: string | null;
    lesson_order: number;
    xp_reward: number;
    created_at: string;
    // Joined fields
    user_stars?: number; // From user_progress
    is_locked?: boolean; // Computed on client
}

export type StepType = 'teach' | 'quiz_easy' | 'quiz_hard' | 'speak';

export interface LessonStep {
    id: number;
    lesson_id: number;
    step_type: StepType;
    step_order: number;
    content: any; // JSONB content
    created_at: string;
}

export interface UserProgress {
    id: number;
    user_id: string;
    lesson_id: number;
    stars: number;
    completed_at: string;
    updated_at: string;
}

export interface UserStats {
    user_id: string;
    total_stars: number;
    lessons_completed: number;
    current_streak: number;
    last_activity_date: string | null;
    updated_at: string;
    // Joined fields for leaderboard
    username?: string; // We might need to fetch this from profiles or metadata
    avatar_url?: string;
}

export interface Badge {
    id: number;
    name: string;
    description: string | null;
    icon_url: string | null;
    criteria: any;
    created_at: string;
}

export interface UserBadge {
    id: number;
    user_id: string;
    badge_id: number;
    awarded_at: string;
    // Joined fields
    badge?: Badge;
}
