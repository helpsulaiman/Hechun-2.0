import { useState, useEffect, useCallback } from 'react';

interface VersionData {
    timestamp: number;
    buildTime: string;
}

export const useUpdateCheck = () => {
    const [isUpdating, setIsUpdating] = useState(false);

    // Store the initial version timestamp when the app loads
    const [initialTimestamp, setInitialTimestamp] = useState<number | null>(null);

    const checkVersion = useCallback(async () => {
        // Skip in development to avoid constant reloads
        if (process.env.NODE_ENV === 'development') return;
        if (isUpdating) return;

        try {
            // Cache-bust to ensure we get the real latest file
            const res = await fetch(`/version.json?t=${Date.now()}`);
            if (!res.ok) return;

            const data: VersionData = await res.json();

            // First load: set the baseline
            if (initialTimestamp === null) {
                setInitialTimestamp(data.timestamp);
                return;
            }

            // Subsequent checks: compare with baseline
            if (data.timestamp > initialTimestamp) {
                console.log('🚀 New version detected! Updating...');
                setIsUpdating(true);

                // Allow UI to show "Updating..." before reload
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        } catch (error) {
            console.error('Failed to check version:', error);
        }
    }, [initialTimestamp, isUpdating]);

    // Check on mount
    useEffect(() => {
        checkVersion();
    }, [checkVersion]);

    // Expose trigger function for testing in development
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            (window as any).triggerUpdate = () => {
                console.log('🔧 Manually triggering update overlay...');
                setIsUpdating(true);
            };
        }
    }, []);

    // Check on window focus/visibility change
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkVersion();
            }
        };

        const handleFocus = () => {
            checkVersion();
        };

        window.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [checkVersion]);

    return { isUpdating };
};
