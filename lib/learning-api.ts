import { SupabaseClient } from '@supabase/supabase-js';
import {
    LearningLesson,
    LessonStep,
    UserProfile
} from '../types/learning';
import { MOCK_LESSONS } from './data/lessons';

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
        let { data: lessons, error: lessonsError } = await supabase
            .from('lessons')
            .select('*')
            .order('lesson_order', { ascending: true });

        // Fallback to Mock Data if DB is empty or fails (Dev Mode)
        if (!lessons || lessons.length === 0) {
            console.warn('DB Lessons Empty. Using Mock Data.');
            lessons = Object.values(MOCK_LESSONS).sort((a, b) => a.lesson_order - b.lesson_order);
            lessonsError = null;
        }

        if (lessonsError) throw new ApiError(`Failed to fetch lessons: ${lessonsError.message}`);

        // ... (rest of function logic remains same, but typescript needs 'lessons' to be defined)
        // I will re-implement the hydration logic here because I am replacing the block

        const hydratedLessons = (lessons as LearningLesson[]).map(lesson => ({
            ...lesson,
            user_score: 0,
            is_locked: false // Default to unlocked, logic applied below
        }));

        // Hydrate with User Progress
        if (userId) {
            // Fix: UserProfile.id != Auth User ID. We need to fetch the Profile ID first.
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('id')
                .eq('user_id', userId)
                .single();

            const profileId = profile?.id;

            if (profileId) {
                const { data: progress } = await supabase
                    .from('lesson_progress')
                    .select('lesson_id, score')
                    .eq('user_id', profileId);

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
                    previousCompleted = (l.user_score || 0) >= 0.6; // Threshold for 'complete'
                });
            } else {
                // Guest or No Profile yet - Rely on LocalStorage hydration client-side or assume unlocked?
                // For safety, unlock first.
                hydratedLessons[0].is_locked = false;
                // Others locked
                for (let i = 1; i < hydratedLessons.length; i++) hydratedLessons[i].is_locked = true;
            }
        } else {
            // No User ID - Likely Guest Mode handled by Dashboard Component State
            // Unlock all for dev? Or default first open.
            hydratedLessons[0].is_locked = false;
            for (let i = 1; i < hydratedLessons.length; i++) hydratedLessons[i].is_locked = true;
        }

        return hydratedLessons;

    } catch (error) {
        console.error('Fetch Lessons Error:', error);
        // Fallback to mock even on error?
        return Object.values(MOCK_LESSONS).sort((a, b) => a.lesson_order - b.lesson_order);
    }
}

export async function fetchLessonWithSteps(supabase: SupabaseClient, lessonId: number): Promise<{ lesson: LearningLesson, steps: LessonStep[] }> {
    try {
        let lesson: LearningLesson | null = null;

        // Try DB Fetch
        const { data, error } = await supabase
            .from('lessons')
            .select('*')
            .eq('id', lessonId)
            .single();

        if (data) {
            lesson = data as LearningLesson;
        } else {
            // Try Mock
            const mock = MOCK_LESSONS[lessonId.toString()];
            if (mock) lesson = mock;
        }

        if (!lesson) throw new ApiError('Lesson not found');

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
        // Try Mock as last resort
        const mock = MOCK_LESSONS[lessonId.toString()];
        if (mock) {
            return {
                lesson: mock,
                steps: (mock.content as any).type === 'structured' ? (mock.content as any).steps : []
            };
        }
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
    if (period === 'all_time') {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .order('total_xp', { ascending: false })
            .limit(50);

        if (error) throw new ApiError(error.message);
        return data || [];
    }

    // --- TIME-BASED LEADERBOARDS ---
    let startTime: Date;
    const now = new Date();

    if (period === 'daily') {
        // Reset at 12 AM IST (UTC+5:30)
        // 1. Convert current UTC to IST
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(now.getTime() + istOffset);
        // 2. Set to Midnight IST
        istDate.setUTCHours(0, 0, 0, 0);
        // 3. Convert back to UTC to get the query timestamp
        startTime = new Date(istDate.getTime() - istOffset);
    } else {
        // Weekly: Rolling 7-day window
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // 1. Fetch Progress in Window
    const { data: progressData, error: progressError } = await supabase
        .from('lesson_progress')
        .select('user_id, score')
        .gte('completed_at', startTime.toISOString());

    if (progressError) throw new ApiError(progressError.message);

    // 2. Aggregate XP per User
    const userScores: Record<string, { xp: number, lessons: number }> = {};

    progressData?.forEach((p: any) => {
        if (!userScores[p.user_id]) {
            userScores[p.user_id] = { xp: 0, lessons: 0 };
        }
        // Calculation must match submitLessonProgress logic (score * 20 typically)
        userScores[p.user_id].xp += Math.floor(p.score * 20);
        if (p.score >= 0.6) userScores[p.user_id].lessons += 1;
    });

    const userIds = Object.keys(userScores);
    if (userIds.length === 0) return [];

    // 3. Fetch User Details
    const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .in('user_id', userIds);

    if (profileError) throw new ApiError(profileError.message);

    // 4. Merge & Sort
    const leaderboard = profiles?.map((profile: UserProfile) => ({
        ...profile,
        total_xp: userScores[profile.user_id]?.xp || 0, // Override total with period XP
        lessons_completed: userScores[profile.user_id]?.lessons || 0
    })) || [];

    return leaderboard.sort((a, b) => b.total_xp - a.total_xp).slice(0, 50);
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

async function pollForProfile(supabase: SupabaseClient, userId: string, retries = 10, delay = 1000): Promise<boolean> {
    for (let i = 0; i < retries; i++) {
        const { data } = await supabase.from('user_profiles').select('id').eq('user_id', userId).maybeSingle();
        if (data) return true;
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    return false;
}

export async function migrateGuestProgress(supabase: SupabaseClient, userId: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
        const progressKey = 'hechun_guest_progress_counts';
        const legacyKey = 'hechun_guest_progress';

        // 1. Check for Guest Data first to avoid waiting unnecessarily
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
        if (lessonIds.length === 0) {
            // No progress to migrate, clear flags just in case? No, might be used for skills.
            // Check skills too?
            const skills = localStorage.getItem('hechun_guest_skills');
            if (!skills) return; // Nothing to migrate
        }

        // 2. Wait for Profile Creation (via Trigger)
        console.log(`Waiting for profile creation for user ${userId}...`);
        const profileExists = await pollForProfile(supabase, userId);

        if (!profileExists) {
            console.error('Migration Aborted: User Profile failed to create within timeout.');
            // Optionally we could retry later, but for now we safeguard against the crash.
            return;
        }

        console.log(`Migrating ${lessonIds.length} guest lessons for user ${userId}`);

        for (const lessonIdStr of lessonIds) {
            const lessonId = parseInt(lessonIdStr);
            // Default score for guest completion = 1.0 (Perfect)
            await submitLessonProgress(supabase, userId, lessonId, 1.0);
        }

        // Migrate Skills if they exist and are better/valid?
        // Current logic only resets triggers via `submitLessonProgress` which calls `updateUserProfile` at the end of each.
        // `submitLessonProgress` DOES update skills iteratively.
        // BUT `submitLessonProgress` logic starts with `currentSkills` = profile skills.
        // If we want to KEEP the guest skills exactly, we might want to manually set them AFTER loop.

        const guestSkillsStr = localStorage.getItem('hechun_guest_skills');
        if (guestSkillsStr) {
            const guestSkills = JSON.parse(guestSkillsStr);
            // Verify if we should overwrite or merge.
            // For a brand new user, overwrite is fine.
            await updateUserProfile(supabase, userId, { skill_vector: guestSkills });
        }

        localStorage.removeItem(progressKey);
        localStorage.removeItem(legacyKey);
        localStorage.removeItem('hechun_guest_skills');

        console.log('Guest progress migrated.');
    } catch (error) {
        console.error('Failed to migrate guest progress:', error);
    }
}
