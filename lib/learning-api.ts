import { SupabaseClient } from '@supabase/supabase-js';
import {
    LearningLesson,
    LessonStep,
    UserProfile
} from '../types/learning';

export class ApiError extends Error {
    constructor(message: string, public statusCode?: number) {
        super(message);
        this.name = 'ApiError';
    }
}

// --- LESSONS (FLAT LIST) ---

export async function fetchLessons(supabase: SupabaseClient, userId?: string): Promise<LearningLesson[]> {
    try {
        // Fetch All Lessons (Sorted by defined order)
        const { data: lessons, error: lessonsError } = await supabase
            .from('lessons')
            .select('*')
            .order('lesson_order', { ascending: true });

        if (lessonsError) throw new ApiError(`Failed to fetch lessons: ${lessonsError.message}`);
        if (!lessons) return [];

        const hydratedLessons = (lessons as LearningLesson[]).map(lesson => ({
            ...lesson,
            user_score: 0,
            is_locked: false // Default to unlocked, logic applied below
        }));

        // Hydrate with User Progress
        if (userId) {
            const { data: progress } = await supabase
                .from('lesson_progress')
                .select('lesson_id, score')
                .eq('user_id', userId);

            const progressMap = new Map(progress?.map((p: any) => [p.lesson_id, p.score]));

            // Logic: Unlock next lesson if previous is completed (score > 0)
            // First lesson is always unlocked
            let previousCompleted = true; // Start true for the first one

            hydratedLessons.forEach((l, index) => {
                l.user_score = progressMap.get(l.id) || 0;

                // Unlock logic: 
                // If it's the first lesson, it's unlocked.
                // Otherwise, it's unlocked only if the PREVIOUS lesson has a score > 0.6 (Passing grade?)
                if (index === 0) {
                    l.is_locked = false;
                } else {
                    l.is_locked = !previousCompleted;
                }

                // Update tracker for next iteration
                previousCompleted = (l.user_score || 0) >= 0.6; // Threshold for "complete"
            });
        }

        return hydratedLessons;

    } catch (error) {
        console.error('Fetch Lessons Error:', error);
        throw error instanceof ApiError ? error : new ApiError('Failed to fetch learning path');
    }
}

export async function fetchLessonWithSteps(supabase: SupabaseClient, lessonId: number): Promise<{ lesson: LearningLesson, steps: LessonStep[] }> {
    try {
        const { data: lesson, error } = await supabase
            .from('lessons')
            .select('*')
            .eq('id', lessonId)
            .single();

        if (error) throw new ApiError(error.message);

        // Parse content
        let steps: LessonStep[] = [];
        if (lesson.content && typeof lesson.content === 'object' && lesson.content.type === 'structured') {
            steps = lesson.content.steps || [];
        } else if (typeof lesson.content === 'string') {
            try {
                const json = JSON.parse(lesson.content);
                if (json.type === 'structured') steps = json.steps;
            } catch (e) { }
        }

        return { lesson, steps };
    } catch (error) {
        throw new ApiError('Failed to load lesson content');
    }
}

// --- USER & LEADERBOARD ---

export async function updateUserProfile(supabase: SupabaseClient, userId: string, updates: Partial<UserProfile>): Promise<void> {
    const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId);

    if (error) throw new ApiError(error.message);

}

export async function fetchUserProfile(supabase: SupabaseClient, userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
    return data;
}

export async function fetchLeaderboard(supabase: SupabaseClient, period: 'daily' | 'weekly' | 'all_time' = 'all_time'): Promise<UserProfile[]> {
    // Optimized: Sort by XP or Lessons Completed
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('total_xp', { ascending: false }) // XP is the new metric
        .limit(50);

    if (error) throw new ApiError(error.message);
    return data || [];
}

// --- PROGRESS ---

export async function submitLessonProgress(supabase: SupabaseClient, userId: string, lessonId: number, score: number): Promise<void> {
    if (!userId) return;

    // 1. Fetch Lesson Metadata (XP Reward & targeted skills)
    const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('xp_reward, skills_targeted, complexity')
        .eq('id', lessonId)
        .single();

    if (lessonError) console.error('Error fetching lesson meta:', lessonError);

    // 2. Upsert Lesson Progress
    const { error: progressError } = await supabase
        .from('lesson_progress')
        .upsert({
            user_id: userId,
            lesson_id: lessonId,
            score: score,
            completed_at: new Date().toISOString()
        }, { onConflict: 'user_id, lesson_id' });

    if (progressError) throw new ApiError(progressError.message);

    // 3. Recalculate User Stats
    // A. Fetch current profile for skills
    const userProfile = await fetchUserProfile(supabase, userId);
    let currentSkills: Record<string, number> = (userProfile?.skill_vector as Record<string, number>) || { reading: 10, writing: 10, speaking: 10, listening: 10 };

    // B. Update Skills if lesson has targets and score is good
    if (lesson?.skills_targeted && score > 0) {
        const targets = lesson.skills_targeted as Record<string, number>; // e.g. { reading: 1.0 }

        // Logic: Skill += (TargetWeight * Complexity * Score * Multiplier)
        // Example: 1.0 * 1.5 (Complexity) * 0.9 (Score) * 5 (Base gain) = +6.75
        const BASE_GAIN = 5;

        Object.entries(targets).forEach(([skill, weight]) => {
            const current = currentSkills[skill] || 10;
            const gain = (weight as number) * (lesson.complexity || 1) * score * BASE_GAIN;
            currentSkills[skill] = Math.min(100, Math.round(current + gain)); // Cap at 100?
        });
    }

    // C. Calculate Total XP & Completed Count
    const { data: allProgress } = await supabase
        .from('lesson_progress')
        .select('score') // removed lesson_id join for now to save query complexity, we'll just sum heuristic or simple count
        .eq('user_id', userId);

    const lessonsCompleted = allProgress?.filter((p: any) => p.score >= 0.6).length || 0;

    // For XP, we should ideally sum actual rewards, but that requires a join. 
    // For now, let's update XP incrementally? 
    // Or just use the heuristic logic to keep it fast, BUT add the current lesson's reward if it's new?
    // Let's stick to the heuristic compatible with "Ground Up": 
    // XP = Sum of (Score * 20). Simple.
    // Or better: currentXP + (LessonReward * Score) if we tracked deltas. 
    // Since we're re-calculating total, let's just make it proportional to lessons completed * 20 roughly.
    // Wait, the previous logic was: totalXP = Math.floor(allProgress?.reduce((acc, p) => acc + (p.score * 10), 0) || 0);
    // Let's buff it to * 20 to feel more rewarding.

    const totalXP = Math.floor(allProgress?.reduce((acc: number, p: any) => acc + (p.score * 20), 0) || 0);

    await updateUserProfile(supabase, userId, {
        lessons_completed: lessonsCompleted,
        total_xp: totalXP,
        last_active_date: new Date().toISOString(),
        skill_vector: currentSkills
    });
}

// --- MIGRATION (Guest -> User) ---

export async function migrateGuestProgress(supabase: SupabaseClient, userId: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
        const progressKey = 'hechun_guest_progress_counts';
        const legacyKey = 'hechun_guest_progress';

        let progressCounts: Record<string, number> = {};
        const storedCounts = localStorage.getItem(progressKey);

        if (storedCounts) {
            progressCounts = JSON.parse(storedCounts);
        } else {
            const legacy = localStorage.getItem(legacyKey);
            if (legacy) {
                const arr = JSON.parse(legacy);
                arr.forEach((id: string) => { progressCounts[id] = 1; });
            }
        }

        const lessonIds = Object.keys(progressCounts);
        if (lessonIds.length === 0) return;

        console.log(`Migrating ${lessonIds.length} guest lessons for user ${userId}`);

        for (const lessonIdStr of lessonIds) {
            const lessonId = parseInt(lessonIdStr);
            // Default score for guest completion = 1.0 (Perfect)
            await submitLessonProgress(supabase, userId, lessonId, 1.0);
        }

        localStorage.removeItem(progressKey);
        localStorage.removeItem(legacyKey);
        localStorage.removeItem('hechun_guest_skills');

        console.log('Guest progress migrated.');
    } catch (error) {
        console.error('Failed to migrate guest progress:', error);
    }
}
