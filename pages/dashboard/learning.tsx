import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from '../../components/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { LearningLevel, LearningLesson } from '../../types/learning';

const ManageLearningPage: React.FC = () => {
    const [levels, setLevels] = useState<LearningLevel[]>([]);
    const [lessons, setLessons] = useState<LearningLesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

    // Form State
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [formData, setFormData] = useState<Partial<LearningLesson>>({ title: '', description: '', lesson_order: 1 });
    const [stepsJson, setStepsJson] = useState('[]');

    useEffect(() => {
        fetchLevels();
    }, []);

    useEffect(() => {
        if (selectedLevel) {
            fetchLessons(selectedLevel);
        }
    }, [selectedLevel]);

    const fetchLevels = async () => {
        const { data } = await supabase.from('learning_levels').select('*').order('level_order');
        if (data) {
            setLevels(data);
            if (data.length > 0 && !selectedLevel) setSelectedLevel(data[0].id);
        }
        setLoading(false);
    };

    const fetchLessons = async (levelId: number) => {
        const { data } = await supabase
            .from('learning_lessons')
            .select('*')
            .eq('level_id', levelId)
            .order('lesson_order');
        if (data) setLessons(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLevel) return;

        try {
            // 1. Create Lesson
            const { data: lesson, error } = await supabase
                .from('learning_lessons')
                .insert([{ ...formData, level_id: selectedLevel }])
                .select()
                .single();

            if (error) throw error;

            // 2. Create Steps (if valid JSON)
            const steps = JSON.parse(stepsJson);
            if (Array.isArray(steps) && steps.length > 0) {
                const stepsWithId = steps.map((s: any, i: number) => ({
                    ...s,
                    lesson_id: lesson.id,
                    step_order: i + 1
                }));

                const { error: stepsError } = await supabase.from('lesson_steps').insert(stepsWithId);
                if (stepsError) throw stepsError;
            }

            alert('Lesson created successfully!');
            setIsFormVisible(false);
            fetchLessons(selectedLevel);
            setFormData({ title: '', description: '', lesson_order: (lessons.length + 1) });
            setStepsJson('[]');

        } catch (error: any) {
            alert('Error: ' + error.message);
        }
    };

    return (
        <>
            <Head>
                <title>Manage Learning</title>
            </Head>
            <DashboardLayout>
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Manage Learning Path</h1>
                    <button onClick={() => setIsFormVisible(!isFormVisible)} className="btn btn-primary">
                        {isFormVisible ? 'Cancel' : '+ Add New Lesson'}
                    </button>
                </div>

                {/* Level Selector */}
                {/* Level Selector */}
                <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                    {levels.map(level => (
                        <button
                            key={level.id}
                            onClick={() => setSelectedLevel(level.id)}
                            className={`px-4 py-2 rounded-full whitespace-nowrap ${selectedLevel === level.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                }`}
                        >
                            {level.name}
                        </button>
                    ))}
                </div>

                {/* Add Lesson Form */}
                {isFormVisible && (
                    <div className="bg-card p-6 rounded-xl shadow-sm border border-border mb-8 fade-in">
                        <h2 className="text-xl font-bold mb-4 text-foreground">Add New Lesson</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-foreground">Title</label>
                                    <input
                                        className="form-input w-full bg-background text-foreground border-border"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-foreground">Order</label>
                                    <input
                                        type="number"
                                        className="form-input w-full bg-background text-foreground border-border"
                                        value={formData.lesson_order}
                                        onChange={e => setFormData({ ...formData, lesson_order: parseInt(e.target.value) })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-foreground">Description</label>
                                <input
                                    className="form-input w-full bg-background text-foreground border-border"
                                    value={formData.description || ''}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-foreground">
                                    Steps JSON (Array of objects with step_type and content)
                                </label>
                                <textarea
                                    className="form-input w-full font-mono text-sm bg-background text-foreground border-border"
                                    rows={10}
                                    value={stepsJson}
                                    onChange={e => setStepsJson(e.target.value)}
                                    placeholder='[{"step_type": "teach", "content": {...}}, {"step_type": "quiz_easy", "content": {...}}]'
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    See seed_content.sql for JSON structure examples.
                                </p>
                            </div>

                            <button type="submit" className="btn btn-primary w-full">Create Lesson</button>
                        </form>
                    </div>
                )}

                {/* Lessons List */}
                <div className="grid gap-4">
                    {lessons.map(lesson => (
                        <div key={lesson.id} className="bg-card p-4 rounded-lg border border-border flex justify-between items-center shadow-sm">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-bold">
                                        #{lesson.lesson_order}
                                    </span>
                                    <h3 className="font-bold text-foreground">{lesson.title}</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">{lesson.description}</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="btn btn-sm btn-secondary" disabled>Edit (Coming Soon)</button>
                                <button className="btn btn-sm btn-danger text-white bg-destructive hover:bg-destructive/90" disabled>Delete</button>
                            </div>
                        </div>
                    ))}
                    {lessons.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">No lessons in this level yet.</p>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
};

export default ManageLearningPage;
