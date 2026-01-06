import { motion } from 'framer-motion';

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
                <ListItemCard key={idx} item={item} idx={idx} />
            ))}
        </div>
    );
}

import AudioPlayer from '../ui/AudioPlayer';

function ListItemCard({ item, idx }: { item: ListItem, idx: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center justify-between p-4 bg-muted hover:bg-muted/80 border border-border rounded-xl transition-colors group"
        >
            <div>
                <div className="text-xl font-bold text-foreground mb-1 text-kashmiri">{item.text}</div>
                <div className="text-muted-foreground">{item.meaning}</div>
            </div>
            {/* Standardized Player */}
            <AudioPlayer src={item.audio || ''} size="md" />
        </motion.div>
    );
}
