export type SkillLevel = 'none' | 'beginner' | 'intermediate' | 'fluent';

export interface SkillProfile {
    reading: SkillLevel;
    writing: SkillLevel;
    speaking: SkillLevel;
}

export interface UserProfile {
    id: string;
    userId: string;
    skillVector: {
        reading: number;
        writing: number;
        speaking: number;
    };
    createdAt: Date;
}

export const SKILL_LEVELS: { id: SkillLevel; label: string; description: string; score: number }[] = [
    { id: 'none', label: 'Absolute Beginner', description: 'I know nothing or just a few words.', score: 0 },
    { id: 'beginner', label: 'Beginner', description: 'I can understand basic phrases and simple sentences.', score: 25 },
    { id: 'intermediate', label: 'Intermediate', description: 'I can have conversations and understand most topics.', score: 50 },
    { id: 'fluent', label: 'Fluent', description: 'I am comfortable with complex topics and native speech.', score: 85 },
];
