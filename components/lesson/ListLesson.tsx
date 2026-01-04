import React from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';

interface ListItem {
    text: string;
    meaning: string;
    audio?: string;
}

interface ListLessonProps {
    content: {
        type: 'list';
        items: ListItem[];
    };
}

export default function ListLesson({ content }: ListLessonProps) {
    return (
        <div className="grid gap-4">
            {content.items.map((item, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer"
                    onClick={() => console.log(`Play word: ${item.text}`)}
                >
                    <div>
                        <div className="text-xl font-bold text-white mb-1 text-kashmiri">{item.text}</div>
                        <div className="text-gray-400">{item.meaning}</div>
                    </div>
                    <button className="p-3 rounded-full bg-white/5 group-hover:bg-indigo-500 hover:text-white transition-colors">
                        <Volume2 className="w-5 h-5" />
                    </button>
                </motion.div>
            ))}
        </div>
    );
}
