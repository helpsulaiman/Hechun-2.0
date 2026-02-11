import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

const useGuestSync = () => {
    const { user, isAuthenticated } = useAuth0();
    const syncGuestData = useMutation(api.users.syncGuestData);

    useEffect(() => {
        if (!isAuthenticated || !user?.sub) return;

        // Check if we've already synced
        const syncedKey = `hechun_synced_${user.sub}`;
        if (localStorage.getItem(syncedKey)) return;

        const sync = async () => {
            try {
                // Read Guest Data
                const progressRaw = localStorage.getItem('hechun_guest_progress_counts');
                const skillsRaw = localStorage.getItem('hechun_guest_skills');
                const streakRaw = localStorage.getItem('hechun_guest_streak');

                if (!progressRaw && !skillsRaw && !streakRaw) return;

                console.log('🔄 Found guest data, syncing to profile...');

                // Prepare Payload
                const guestLessons = progressRaw ? Object.entries(JSON.parse(progressRaw)).map(([id, count]) => ({
                    id, // "skill-order"
                    count: Number(count)
                })) : [];

                const guestSkills = skillsRaw ? JSON.parse(skillsRaw) : undefined;

                let guestStreak = 0;
                if (streakRaw) {
                    try {
                        const s = JSON.parse(streakRaw);
                        guestStreak = s.currentStreak || 0;
                    } catch (e) { }
                }

                if (guestLessons.length === 0 && !guestSkills && !guestStreak) return;

                // Call Mutation
                const result = await syncGuestData({
                    userId: user.sub!,
                    guestLessons,
                    guestSkills,
                    guestStreak
                });

                console.log('✅ Guest data synced:', result);

                // Mark as synced
                localStorage.setItem(syncedKey, 'true');

                // Optional: Notify user (toast)
                // toast.success(`Synced ${result.syncedLessons} lessons from guest session!`);

            } catch (error) {
                console.error('❌ Guest sync failed:', error);
            }
        };

        sync();

    }, [isAuthenticated, user, syncGuestData]);
};

export default useGuestSync;
