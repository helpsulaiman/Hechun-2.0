
import React, { useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { TeachContent } from '../../types/learning';

interface TeachStepProps {
    content: TeachContent;
    onComplete?: () => void;
}

export default function TeachStep({ content }: TeachStepProps) {
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

            <h2 className="text-3xl font-bold text-white">{content.title}</h2>

            {/* Main Content Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-lg relative lg:min-h-[250px] flex flex-col justify-center">
                {content.kashmiri_text && (
                    <div className="mb-6">
                        <span className="text-6xl md:text-7xl font-bold text-kashmiri text-indigo-300 drop-shadow-lg block leading-relaxed mb-2">
                            {content.kashmiri_text}
                        </span>
                    </div>
                )}

                {content.transliteration && (
                    <p className="text-xl text-indigo-200 italic font-medium opacity-80 mb-2">
                        "{content.transliteration}"
                    </p>
                )}

                {content.translation && (
                    <p className="text-lg text-gray-400">
                        {content.translation}
                    </p>
                )}

                {content.audio_url && (
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={playAudio}
                            className={`p-4 rounded-full transition-all ${isPlaying ? 'bg-indigo-500 text-white scale-110 shadow-lg shadow-indigo-500/50' : 'bg-white/10 text-indigo-300 hover:bg-white/20'}`}
                        >
                            <Volume2 className={`w-8 h-8 ${isPlaying ? 'animate-pulse' : ''}`} />
                        </button>
                        <audio ref={audioRef} src={content.audio_url} className="hidden" />
                    </div>
                )}
            </div>

            <p className="text-xl text-gray-300 max-w-lg leading-relaxed">
                {content.description}
            </p>
        </div>
    );
}
