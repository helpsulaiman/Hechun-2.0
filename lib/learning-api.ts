import { SupabaseClient } from '@supabase/supabase-js';
export class ApiError extends Error {
    constructor(message: string, public statusCode?: number) {
        super(message);
        this.name = 'ApiError';
    }
}
import {
    LearningLevel,
    LearningLesson,
    LessonStep,
    UserProgress,
    UserStats,
    Badge
} from '../types/learning';

// --- LEVELS & LESSONS ---

export async function fetchLevelsWithLessons(supabase: SupabaseClient, userId?: string): Promise<LearningLevel[]> {
    try {
        // 1. Fetch all levels
        const { data: levels, error: levelsError } = await supabase
            .from('learning_levels')
            .select('*')
            .order('level_order', { ascending: true });

        if (levelsError) throw new ApiError(`Failed to fetch levels: ${levelsError.message}`);
        if (!levels) return [];

        // 2. Fetch user stats to check total stars (for unlocking levels)
        let totalStars = 0;
        if (userId) {
            const { data: stats } = await supabase
                .from('user_stats')
                .select('total_stars')
                .eq('user_id', userId)
                .single();
            totalStars = stats?.total_stars || 0;
        }

        // 3. For each level, fetch lessons and attach lock status
        const levelsWithLessons = await Promise.all(levels.map(async (level) => {
            const { data: lessons, error: lessonsError } = await supabase
                .from('learning_lessons')
                .select('*')
                .eq('level_id', level.id)
                .order('lesson_order', { ascending: true });

            if (lessonsError) throw new ApiError(`Failed to fetch lessons for level ${level.id}: ${lessonsError.message}`);

            // Attach user progress if logged in OR check localStorage for guest
            let lessonsWithProgress = lessons || [];
            if (userId) {
                const { data: progress } = await supabase
                    .from('user_progress')
                    .select('lesson_id, stars')
                    .eq('user_id', userId);

                lessonsWithProgress = lessonsWithProgress.map(lesson => {
                    const p = progress?.find(p => p.lesson_id === lesson.id);
                    return {
                        ...lesson,
                        user_stars: p?.stars || 0,
                        is_locked: false // We'll calculate this logic in the UI or here
                    };
                });
            } else if (typeof window !== 'undefined') {
                // Guest mode: Read from localStorage
                try {
                    const localProgress = JSON.parse(localStorage.getItem('hechun_guest_progress') || '{}');
                    lessonsWithProgress = lessonsWithProgress.map(lesson => {
                        const stars = localProgress[lesson.id] || 0;
                        return {
                            ...lesson,
                            user_stars: stars,
                            is_locked: false
                        };
                    });

                    // Calculate total stars for guest to unlock levels
                    totalStars = Object.values(localProgress).reduce((sum: number, stars: any) => sum + (Number(stars) || 0), 0);
                } catch (e) {
                    console.error('Error reading guest progress', e);
                }
            }

            // Determine if level is locked based on stars
            const isLevelLocked = totalStars < level.min_stars_required;

            return {
                ...level,
                lessons: lessonsWithProgress,
                is_locked: isLevelLocked
            };
        }));

        return levelsWithLessons;
    } catch (error) {
        console.error('Error fetching learning path:', error);
        throw error instanceof ApiError ? error : new ApiError('Failed to fetch learning path');
    }
}

export async function fetchLessonWithSteps(supabase: SupabaseClient, lessonId: number): Promise<{ lesson: LearningLesson, steps: LessonStep[] }> {
    try {
        // Fetch lesson details
        const { data: lesson, error: lessonError } = await supabase
            .from('learning_lessons')
            .select('*')
            .eq('id', lessonId)
            .single();

        if (lessonError) throw new ApiError(`Failed to fetch lesson: ${lessonError.message}`);

        // Fetch steps
        const { data: steps, error: stepsError } = await supabase
            .from('lesson_steps')
            .select('*')
            .eq('lesson_id', lessonId)
            .order('step_order', { ascending: true });

        if (stepsError) throw new ApiError(`Failed to fetch steps: ${stepsError.message}`);

        // Parse content if it's a string (defensive coding against double-encoding)
        const parsedSteps = (steps || []).map(step => {
            if (typeof step.content === 'string') {
                try {
                    return { ...step, content: JSON.parse(step.content) };
                } catch (e) {
                    console.error(`Failed to parse step content for step ${step.id}:`, e);
                    return step;
                }
            }
            return step;
        });

        return { lesson, steps: parsedSteps };
    } catch (error) {
        console.error('Error fetching lesson content:', error);
        throw error instanceof ApiError ? error : new ApiError('Failed to fetch lesson content');
    }
}
// --- USER PROFILE ---

export async function updateUserProfile(supabase: SupabaseClient, userId: string, username: string): Promise<void> {
    try {
        // Update user_stats with new username
        const { error } = await supabase
            .from('user_stats')
            .upsert({
                user_id: userId,
                username: username,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        if (error) throw new ApiError(`Failed to update profile: ${error.message}`);

        // Also update auth metadata for consistency if needed
        await supabase.auth.updateUser({
            data: { full_name: username }
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        throw error instanceof ApiError ? error : new ApiError('Failed to update profile');
    }
}

export async function fetchUserStats(supabase: SupabaseClient, userId: string): Promise<UserStats | null> {
    try {
        const { data, error } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new ApiError(`Failed to fetch stats: ${error.message}`);
        }
        return data;
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return null;
    }
}

// --- PROGRESS & STATS ---

export async function submitLessonProgress(supabase: SupabaseClient, userId: string | undefined, lessonId: number, stars: number): Promise<Badge | null> {
    try {
        if (!userId) {
            console.log('Submitting guest progress for lesson', lessonId, 'stars', stars);
            // Guest mode: Save to localStorage
            if (typeof window !== 'undefined') {
                const localProgress = JSON.parse(localStorage.getItem('hechun_guest_progress') || '{}');
                // Only update if new stars are higher or it's a new entry
                if ((localProgress[lessonId] || 0) < stars) {
                    localProgress[lessonId] = stars;
                    localStorage.setItem('hechun_guest_progress', JSON.stringify(localProgress));
                    console.log('Guest progress saved to localStorage');
                }
            }
            return null;
        }

        // Verify auth state inside the function
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authUser?.id !== userId) {
            // Auth mismatch - this shouldn't happen in normal flow
        }

        // 1. Upsert user_progress
        const { data: progressData, error: progressError } = await supabase
            .from('user_progress')
            .upsert({
                user_id: userId,
                lesson_id: lessonId,
                stars: stars,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id, lesson_id' })
            .select();

        if (progressError) {
            console.error('Supabase WRITE ERROR:', JSON.stringify(progressError, null, 2));
            throw new ApiError(`Failed to save progress: ${progressError.message}`);
        }

        // Progress saved successfully

        // 2. Update user_stats (re-calculate totals)
        // Fetch all progress for this user to calculate total stars
        const { data: allProgress, error: fetchProgressError } = await supabase
            .from('user_progress')
            .select('stars')
            .eq('user_id', userId);

        if (fetchProgressError) {
            console.error('Error fetching all progress:', fetchProgressError);
            // Don't throw, just log. We still saved the current lesson progress.
        } else {
            const totalStars = allProgress?.reduce((sum, p) => sum + p.stars, 0) || 0;
            const lessonsCompleted = allProgress?.filter(p => p.stars > 0).length || 0;

            const { error: statsError } = await supabase
                .from('user_stats')
                .upsert({
                    user_id: userId,
                    total_stars: totalStars,
                    lessons_completed: lessonsCompleted,
                    last_activity_date: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

            if (statsError) {
                console.error('Failed to update stats:', statsError);
                // Don't throw, as the primary action (saving lesson progress) succeeded
            }
        }

        // 3. Check for badges
        const earnedBadge = await checkAndAwardBadges(supabase, userId, lessonId);
        return earnedBadge;

    } catch (error) {
        console.error('Error submitting progress:', error);
        throw error instanceof ApiError ? error : new ApiError('Failed to submit progress');
    }
}

export async function migrateGuestProgress(supabase: SupabaseClient, userId: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
        const localProgress = JSON.parse(localStorage.getItem('hechun_guest_progress') || '{}');
        const lessonIds = Object.keys(localProgress);

        if (lessonIds.length === 0) return;

        console.log(`Migrating ${lessonIds.length} guest lessons for user ${userId}`);

        for (const lessonIdStr of lessonIds) {
            const lessonId = parseInt(lessonIdStr);
            const stars = localProgress[lessonIdStr];

            // Re-use submit logic which handles upsert and stats aggregation
            await submitLessonProgress(supabase, userId, lessonId, stars);
        }

        // Clear local storage after successful migration
        localStorage.removeItem('hechun_guest_progress');
        console.log('Guest progress migrated and cleared.');
    } catch (error) {
        console.error('Failed to migrate guest progress:', error);
    }
}

export async function fetchLeaderboard(supabase: SupabaseClient, period: 'daily' | 'weekly' | 'all_time' = 'all_time', currentUserId?: string): Promise<UserStats[]> {
    try {
        if (period === 'all_time') {
            const { data, error } = await supabase
                .from('user_stats')
                .select('*')
                .order('total_stars', { ascending: false })
                .limit(50);

            if (error) throw new ApiError(`Failed to fetch leaderboard: ${error.message}`);

            let allUsers = data || [];

            // Inject Guest User ONLY if user is NOT logged in (Client-side only merge)
            if (typeof window !== 'undefined' && !currentUserId) {
                try {
                    const localProgress = JSON.parse(localStorage.getItem('hechun_guest_progress') || '{}');
                    const totalStars = Object.values(localProgress).reduce((sum: number, stars: any) => sum + (Number(stars) || 0), 0);
                    const lessonsCompleted = Object.values(localProgress).filter((s: any) => s > 0).length;

                    if (totalStars > 0) {
                        const guestUser: UserStats = {
                            user_id: 'guest',
                            username: 'You',
                            total_stars: totalStars,
                            lessons_completed: lessonsCompleted,
                            current_streak: 0,
                            last_activity_date: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        };
                        allUsers.push(guestUser);
                        // Re-sort
                        allUsers.sort((a, b) => b.total_stars - a.total_stars);
                    }
                } catch (e) { /* ignore localStorage errors */ }
            }

            return allUsers.slice(0, 50);
        } else {
            // Calculated Daily/Weekly stats from user_progress
            const now = new Date();
            let cutoffDate = new Date();

            if (period === 'daily') {
                cutoffDate.setHours(0, 0, 0, 0); // Start of today
            } else if (period === 'weekly') {
                const day = now.getDay();
                const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
                cutoffDate = new Date(now.setDate(diff));
                cutoffDate.setHours(0, 0, 0, 0); // Start of week (Monday)
            }

            // Fetch progress updated/created after cutoff
            const { data: progress, error: progressError } = await supabase
                .from('user_progress')
                .select('user_id, stars, updated_at')
                .gte('updated_at', cutoffDate.toISOString());

            if (progressError) throw new ApiError(`Failed to fetch progress: ${progressError.message}`);

            // Aggregate stars by user
            const userMap = new Map<string, { stars: number, lessons: number }>();
            progress?.forEach(p => {
                const current = userMap.get(p.user_id) || { stars: 0, lessons: 0 };
                userMap.set(p.user_id, {
                    stars: current.stars + p.stars,
                    lessons: current.lessons + 1 // Simply counting entries in period as "activity"
                });
            });

            if (userMap.size === 0) return [];

            const userIds = Array.from(userMap.keys());

            // Fetch user details for these IDs
            const { data: userDetails, error: userError } = await supabase
                .from('user_stats')
                .select('user_id, username')
                .in('user_id', userIds);

            if (userError) throw new ApiError(`Failed to fetch user details: ${userError.message}`);

            // Combine data
            const leaderboard: UserStats[] = userIds.map(uid => {
                const stats = userMap.get(uid)!;
                const user = userDetails?.find(u => u.user_id === uid);
                return {
                    user_id: uid,
                    username: user?.username || 'Learner',
                    total_stars: stats.stars,
                    lessons_completed: stats.lessons,
                    current_streak: 0,
                    last_activity_date: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                } as UserStats;
            });

            // Sort by stars descending
            const sorted = leaderboard.sort((a, b) => b.total_stars - a.total_stars);

            // Inject Guest User ONLY if user is NOT logged in
            if (typeof window !== 'undefined' && !currentUserId) {
                const localProgress = JSON.parse(localStorage.getItem('hechun_guest_progress') || '{}');
                const totalStars = Object.values(localProgress).reduce((sum: number, stars: any) => sum + (Number(stars) || 0), 0);
                const lessonsCompleted = Object.values(localProgress).filter((s: any) => s > 0).length;

                if (totalStars > 0) {
                    const guestUser: UserStats = {
                        user_id: 'guest',
                        username: 'You',
                        total_stars: totalStars,
                        lessons_completed: lessonsCompleted,
                        current_streak: 0,
                        last_activity_date: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };

                    // Insert into sorted array
                    sorted.push(guestUser);
                    sorted.sort((a, b) => b.total_stars - a.total_stars);
                }
            }

            return sorted.slice(0, 50);
        }
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        throw error instanceof ApiError ? error : new ApiError('Failed to fetch leaderboard');
    }
}

// --- BADGES ---

async function checkAndAwardBadges(supabase: SupabaseClient, userId: string, lessonId: number): Promise<Badge | null> {
    try {
        console.log('Checking badges for user', userId, 'lesson', lessonId);
        // Get the lesson to find out which level it belongs to
        const { data: lesson } = await supabase
            .from('learning_lessons')
            .select('level_id')
            .eq('id', lessonId)
            .single();

        if (!lesson) {
            console.log('Badge check: Lesson not found');
            return null;
        }

        console.log('Badge check: Lesson belongs to level', lesson.level_id);

        // Check if all lessons in this level are completed
        const { data: levelLessons } = await supabase
            .from('learning_lessons')
            .select('id')
            .eq('level_id', lesson.level_id);

        if (!levelLessons) {
            console.log('Badge check: No lessons found for level');
            return null;
        }

        const { data: userProgress } = await supabase
            .from('user_progress')
            .select('lesson_id')
            .eq('user_id', userId)
            .gt('stars', 0); // Completed lessons

        const completedLessonIds = new Set(userProgress?.map(p => p.lesson_id));
        const allCompleted = levelLessons.every(l => completedLessonIds.has(l.id));

        console.log('Badge check: Level lessons', levelLessons.map(l => l.id), 'Completed', Array.from(completedLessonIds), 'All completed?', allCompleted);

        if (allCompleted) {
            // Find the badge for this level
            const { data: badges } = await supabase
                .from('badges')
                .select('*');

            // Parse criteria JSON if it's a string, or use it directly if it's an object
            // Supabase returns JSON columns as objects usually, but let's be safe
            const levelBadge = badges?.find(b => {
                const criteria = typeof b.criteria === 'string' ? JSON.parse(b.criteria) : b.criteria;
                return criteria?.type === 'level_complete' && criteria?.level_id === lesson.level_id;
            });

            if (levelBadge) {
                console.log('Badge check: Found badge to award', levelBadge.name);
                // Award badge if not already owned
                const { error: awardError } = await supabase
                    .from('user_badges')
                    .upsert({
                        user_id: userId,
                        badge_id: levelBadge.id,
                        awarded_at: new Date().toISOString()
                    }, { onConflict: 'user_id, badge_id' });

                if (awardError) {
                    console.error('Badge check: Error awarding badge', awardError);
                    return null;
                } else {
                    console.log('Badge check: Badge awarded successfully');
                    return levelBadge as Badge;
                }
            } else {
                console.log('Badge check: No badge found for this level');
            }
        }
        return null;
    } catch (error) {
        console.error('Error checking badges:', error);
        // Don't throw, as it shouldn't block progress submission
        return null;
    }
}

export async function fetchUserBadges(supabase: SupabaseClient, userId: string) {
    try {
        const { data, error } = await supabase
            .from('user_badges')
            .select('*, badge:badges(*)')
            .eq('user_id', userId);

        if (error) throw new ApiError(`Failed to fetch badges: ${error.message}`);
        return data || [];
    } catch (error) {
        console.error('Error fetching badges:', error);
        throw error instanceof ApiError ? error : new ApiError('Failed to fetch badges');
    }
}

export async function fetchNextLesson(supabase: SupabaseClient, levelId: number, currentLessonOrder: number): Promise<LearningLesson | null> {
    const { data, error } = await supabase
        .from('learning_lessons')
        .select('*')
        .eq('level_id', levelId)
        .gt('lesson_order', currentLessonOrder)
        .order('lesson_order', { ascending: true })
        .limit(1)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // No next lesson found
        console.error('Error fetching next lesson:', error);
        return null;
    }

    return data;
}
