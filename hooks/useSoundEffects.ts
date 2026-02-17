import { useCallback, useEffect, useRef } from 'react';

type SoundType = 'correct' | 'wrong' | 'complete';

const SOUND_PATHS: Record<SoundType, string> = {
    correct: '/sound_effects/correct.wav',
    wrong: '/sound_effects/wrong.wav',
    complete: '/sound_effects/lesson-complete.wav',
};

export const useSoundEffects = () => {
    const audioRefs = useRef<Record<SoundType, HTMLAudioElement | null>>({
        correct: null,
        wrong: null,
        complete: null,
    });

    useEffect(() => {
        // Preload sounds
        Object.entries(SOUND_PATHS).forEach(([key, path]) => {
            const audio = new Audio(path);
            audio.preload = 'auto';
            audioRefs.current[key as SoundType] = audio;
        });
    }, []);

    const playSound = useCallback((type: SoundType) => {
        const audio = audioRefs.current[type];
        if (audio) {
            audio.currentTime = 0; // Reset to start
            audio.play().catch(err => {
                console.warn(`Failed to play ${type} sound:`, err);
            });
        }
    }, []);

    return { playSound };
};
