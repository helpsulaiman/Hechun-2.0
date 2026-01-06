export interface LearningLevel {
    id: number;
    name: string;
    description: string | null;
    level_order: number;
    min_stars: number;
    lessons?: LearningLesson[];
    is_locked?: boolean; // Hydrated UI state
}

export interface LearningLesson {
    id: number;
    title: string;
    description: string | null;
    lesson_order: number;
    content: any; // JSON Structured Content
    complexity: number;
    skills_targeted: any;
    xp_reward: number;
    skill_reward?: Record<string, number>;

    // Joint / Hydrated fields
    user_score?: number; // 0.0 - 1.0 (Accuracy)
    is_locked?: boolean;
    times_completed?: number;
}

export interface TeachContent {
    title: string;
    description: string;
    kashmiri_text?: string;
    transliteration?: string;
    translation?: string; // English meaning
    audio_url?: string;
    image_url?: string;
}

export interface LessonStep {
    type: 'teach' | 'quiz' | 'dialogue'; // Inferred from content JSON
    content: TeachContent | any;
}

export interface UserProfile {
    id: string; // Internal UUID
    user_id: string; // Auth ID
    username: string | null;
    email: string | null;
    avatar_url: string | null;
    lessons_completed: number;
    total_xp: number;
    streak_days: number;
    last_active_date: string | null;
    skill_vector: any;
    is_admin?: boolean;
    created_at: string;
}

// Deprecated: Alias for backward compatibility during refactor if needed
export type UserStats = UserProfile;
