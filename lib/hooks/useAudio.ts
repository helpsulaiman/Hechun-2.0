import { useState, useEffect, useRef } from 'react';

type AudioStatus = 'idle' | 'loading' | 'playing' | 'error';

export function useAudio(url: string | undefined) {
    const [status, setStatus] = useState<AudioStatus>('idle');
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!url) return;

        const audio = new Audio(url);
        audioRef.current = audio;

        const handleLoadStart = () => setStatus('loading');
        const handleCanPlay = () => setStatus('idle'); // Ready
        const handlePlay = () => setStatus('playing');
        const handleEnded = () => setStatus('idle');
        const handleError = () => {
            console.warn(`Audio missing or failed to load: ${url}`);
            setStatus('error');
        };

        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('canplaythrough', handleCanPlay);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('loadstart', handleLoadStart);
            audio.removeEventListener('canplaythrough', handleCanPlay);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
            audio.pause();
        };
    }, [url]);

    const play = () => {
        if (audioRef.current) {
            // Reset if already played
            if (status === 'playing') {
                audioRef.current.currentTime = 0;
            }

            setStatus('playing'); // Optimistic update
            audioRef.current.play().catch(e => {
                console.warn("Playback failed:", e);
                setStatus('error');
            });
        }
    };

    return { play, status };
}
