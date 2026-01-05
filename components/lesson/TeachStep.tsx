
import React, { useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { TeachContent } from '../../types/learning';

interface TeachStepProps {
    content: TeachContent & { transliteration?: string };
    showTransliteration?: boolean;
}

export default function TeachStep({ content, showTransliteration }: TeachStepProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const playAudio = () => {
        if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
            audioRef.current.onended = () => setIsPlaying(false);
        }
    };

    return (
        <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {content.image_url && (
                <img
                    src={content.image_url}
                    alt={content.title}
                    className="w-48 h-48 object-contain mb-4 rounded-xl bg-white/5 p-4"
                />
            )}

            <h2 className="text-3xl font-bold text-white dark:text-white text-gray-900">{content.title}</h2>

            {/* Main Content Card */}
            <div className="bg-white/5 border border-white/10 dark:bg-white/5 dark:border-white/10 bg-gray-50 border-gray-200 rounded-2xl p-8 w-full max-w-lg relative lg:min-h-[250px] flex flex-col justify-center">
                {content.kashmiri_text && (
                    <div className="mb-6">
                        <span className="text-6xl md:text-7xl font-bold text-kashmiri text-indigo-600 dark:text-indigo-300 drop-shadow-lg block leading-relaxed mb-2">
                            {content.kashmiri_text}
                        </span>
                    </div>
                )}

                {/* Content Body */}
                <div className="prose prose-indigo dark:prose-invert max-w-none text-lg leading-relaxed text-gray-700 dark:text-gray-200">
                    {/* We'd ideally use a markdown parser here. For MVP, we'll assume it's just text */}
                    <p>{content.description}</p>

                    {showTransliteration && content.transliteration && (
                        <p className="mt-4 text-indigo-600 dark:text-indigo-300 font-mono text-base border-t border-gray-200 dark:border-white/10 pt-4">
                            {content.transliteration}
                        </p>
                    )}
                </div>

                {content.audio_url && (
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={playAudio}
                            className={`p-4 rounded-full transition-all ${isPlaying ? 'bg-indigo-500 text-white scale-110 shadow-lg shadow-indigo-500/50' : 'bg-white hover:bg-gray-100 text-indigo-600 dark:bg-white/10 dark:text-indigo-300 dark:hover:bg-white/20'} `}
                        >
                            <Volume2 className={`w-8 h-8 ${isPlaying ? 'animate-pulse' : ''} `} />
                        </button>
                        <audio ref={audioRef} src={content.audio_url} className="hidden" />
                    </div>
                )}
            </div>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-lg leading-relaxed">
                {content.description}
            </p>
        </div>
    );
}
