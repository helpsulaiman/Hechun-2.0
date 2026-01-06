
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DashboardLayout from '../../../../components/DashboardLayout';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Save, ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';

const LESSON_TEMPLATES = {
    dialogue: {
        type: 'structured',
        kind: 'lesson',
        steps: [
            {
                type: 'dialogue',
                content: {
                    speakers: [
                        { id: 'A', name: 'Asif', avatar: '/avatars/asif.png', position: 'left' },
                        { id: 'B', name: 'Saima', avatar: '/avatars/saima.png', position: 'right' }
                    ],
                    lines: [
                        { speakerId: 'A', text: 'Kashmiri text here', translation: 'English translation', audio: '/audio/1.mp3' },
                        { speakerId: 'B', text: 'Response here', translation: 'English response', audio: '/audio/2.mp3' }
                    ]
                }
            }
        ]
    },
    vocabulary: {
        type: 'structured',
        kind: 'lesson',
        steps: [
            {
                type: 'vocabulary',
                content: {
                    items: [
                        { term: 'Word', translation: 'Translation', pronunciation: 'Pronunciation', audio: '/audio/word.mp3' },
                        { term: 'Another', translation: 'Translation', pronunciation: 'Pronunciation', audio: '/audio/word2.mp3' }
                    ]
                }
            }
        ]
    },
    quiz: {
        type: 'structured',
        kind: 'quiz',
        steps: [
            {
                type: 'quiz',
                content: {
                    question: 'What does "Salam" mean?',
                    options: ['Hello', 'Goodbye', 'Thank you'],
                    correctAnswer: 'Hello',
                    explanation: 'Salam is the standard greeting.'
                }
            }
        ]
    }
};

const EditLessonPage: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const supabase = useSupabaseClient();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lesson, setLesson] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        complexity: 1.0,
        lesson_order: 0,
        content: ''
    });

    useEffect(() => {
        if (id) fetchLesson();
    }, [id]);

    const fetchLesson = async () => {
        try {
            const { data, error } = await supabase
                .from('lessons')
                .select('*')
                .eq('id', Number(id))
                .single();

            if (error) throw error;

            setLesson(data);
            setFormData({
                title: data.title,
                description: data.description || '',
                complexity: data.complexity,
                lesson_order: data.lesson_order,
                content: typeof data.content === 'string' ? data.content : JSON.stringify(data.content, null, 2)
            });
        } catch (error) {
            console.error('Error fetching lesson:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Validate JSON
            let parsedContent;
            try {
                parsedContent = JSON.parse(formData.content);
            } catch (err) {
                alert('Invalid JSON Content');
                setSaving(false);
                return;
            }

            const updates = {
                title: formData.title,
                description: formData.description,
                complexity: parseFloat(formData.complexity.toString()),
                lesson_order: parseInt(formData.lesson_order.toString()),
                content: parsedContent
            };

            const { error } = await supabase
                .from('lessons')
                .update(updates)
                .eq('id', Number(id));

            if (error) throw error;
            alert('Lesson updated successfully!');
            router.push('/dashboard/lessons');

        } catch (error: any) {
            console.error('Error updating lesson:', error);
            alert('Failed to update: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleTypeChange = (newKind: string) => {
        try {
            const parsed = JSON.parse(formData.content || '{}');
            parsed.kind = newKind;
            // Also ensure type is structured if it's new
            if (!parsed.type) parsed.type = 'structured';
            if (!parsed.steps) parsed.steps = [];

            setFormData({ ...formData, content: JSON.stringify(parsed, null, 2) });
        } catch (e) {
            alert("Cannot update type: Invalid JSON content.");
        }
    };

    const applyTemplate = (type: 'dialogue' | 'vocabulary' | 'quiz') => {
        if (formData.content && formData.content.length > 50) {
            if (!confirm('This will overwrite current content. Continue?')) return;
        }
        setFormData({ ...formData, content: JSON.stringify(LESSON_TEMPLATES[type], null, 2) });
    };

    // Helper to get current kind safely
    const getCurrentKind = () => {
        try {
            const content = JSON.parse(formData.content);
            return content.kind || 'lesson';
        } catch (e) { return 'lesson'; }
    };

    if (loading) return <div className="p-10 text-center text-white">Loading...</div>;
    if (!lesson) return <div className="p-10 text-center text-white">Lesson not found</div>;

    return (
        <DashboardLayout>
            <Head>
                <title>Edit Lesson {id} - Hechun Admin</title>
            </Head>

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/dashboard/lessons" className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Edit Lesson: {lesson.title}</h1>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Title</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        {/* Order */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Order</label>
                            <input
                                type="number"
                                required
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.lesson_order}
                                onChange={e => setFormData({ ...formData, lesson_order: Number(e.target.value) })}
                            />
                        </div>

                        {/* Complexity */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Complexity (1.0 - 10.0)</label>
                            <input
                                type="number"
                                step="0.1"
                                required
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.complexity}
                                onChange={e => setFormData({ ...formData, complexity: Number(e.target.value) })}
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-300">Description</label>
                            <textarea
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* JSON Content Editor */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end mb-2">
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium text-gray-300">
                                    Content (JSON)
                                </label>
                                {/* Type Selector */}
                                <select
                                    value={getCurrentKind()}
                                    onChange={(e) => handleTypeChange(e.target.value)}
                                    className="bg-gray-800 border border-gray-700 text-white text-xs rounded px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="lesson">Teaching Lesson</option>
                                    <option value="quiz">Quiz / Test</option>
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <span className="text-xs text-gray-500 self-center mr-2">Load Template:</span>
                                <button type="button" onClick={() => applyTemplate('dialogue')} className="text-xs bg-gray-800 hover:bg-gray-700 text-indigo-400 border border-gray-700 px-3 py-1.5 rounded transition-colors">
                                    Dialogue
                                </button>
                                <button type="button" onClick={() => applyTemplate('vocabulary')} className="text-xs bg-gray-800 hover:bg-gray-700 text-emerald-400 border border-gray-700 px-3 py-1.5 rounded transition-colors">
                                    Vocabulary
                                </button>
                                <button type="button" onClick={() => applyTemplate('quiz')} className="text-xs bg-gray-800 hover:bg-gray-700 text-amber-400 border border-gray-700 px-3 py-1.5 rounded transition-colors">
                                    Quiz
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-green-400 font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-[500px]"
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                        <Link href="/dashboard/lessons" className="px-6 py-3 rounded-lg text-gray-300 hover:bg-white/5 transition-colors font-medium">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                        >
                            <Save className="w-5 h-5" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default EditLessonPage;
