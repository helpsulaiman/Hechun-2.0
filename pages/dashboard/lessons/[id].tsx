import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Head from 'next/head';
import DashboardLayout from '../../../components/DashboardLayout';
import { fetchLessonWithSteps } from '../../../lib/learning-api';
import { LearningLesson, LessonStep } from '../../../types/learning';
import Link from 'next/link';

// Local interface for editing state, looser than the strict schema
interface EditableStep {
    id?: number;
    lesson_id?: number;
    step_type: string;
    step_order?: number;
    content: any;
}

const EditLessonPage: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const supabase = useSupabaseClient();

    const [lesson, setLesson] = useState<Partial<LearningLesson>>({});
    const [steps, setSteps] = useState<EditableStep[]>([]);
    const [deletedStepIds, setDeletedStepIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (id && typeof id === 'string') {
            loadLesson(parseInt(id));
        }
    }, [id]);

    const loadLesson = async (lessonId: number) => {
        try {
            setLoading(true);
            const { lesson, steps } = await fetchLessonWithSteps(supabase, lessonId);
            setLesson(lesson);
            // Map strict steps to editable format
            setSteps(steps.map((s: any, i) => ({
                id: i, // distinct index as ID for now since we don't have real IDs in JSON yet
                step_type: s.type || 'teach',
                content: s.content,
                step_order: i + 1
            })));
        } catch (error) {
            console.error('Error loading lesson:', error);
            setMessage({ type: 'error', text: 'Failed to load lesson' });
        } finally {
            setLoading(false);
        }
    };

    const handleLessonChange = (field: keyof LearningLesson, value: any) => {
        setLesson(prev => ({ ...prev, [field]: value }));
    };

    const STEP_TEMPLATES: Record<string, string> = {
        teach: JSON.stringify({
            title: "Lesson Title",
            description: "Brief explanation of the concept.",
            kashmiri_text: "",
            transliteration: "",
            audio_url: null
        }, null, 2),
        quiz_easy: JSON.stringify({
            question: "Question text here?",
            options: ["Correct Answer", "Option 2", "Option 3", "Option 4"],
            correct_answer: "Correct Answer",
            hint: "Optional hint"
        }, null, 2),
        quiz_hard: JSON.stringify({
            question: "Complex question text here?",
            options: ["Correct Answer", "Option 2", "Option 3", "Option 4"],
            correct_answer: "Correct Answer",
            hint: "Optional hint"
        }, null, 2),
        speak: JSON.stringify({
            title: "Speak the following",
            kashmiri_text: "Text to speak",
            transliteration: "Pronunciation guide"
        }, null, 2)
    };

    const handleStepChange = (index: number, field: string, value: any) => {
        const newSteps = [...steps];
        // @ts-ignore - Dynamic field access
        let updatedStep = { ...newSteps[index], [field]: value };

        // Auto-fill template if type changes
        if (field === 'step_type' && STEP_TEMPLATES[value as string]) {
            updatedStep.content = STEP_TEMPLATES[value as string];
        }

        newSteps[index] = updatedStep;
        setSteps(newSteps);
    };

    const handleContentChange = (index: number, jsonString: string) => {
        const newSteps = [...steps];
        try {
            // We store the string temporarily to allow editing, but validity is checked separately if needed
            // For now, we accept string input and let user fix valid JSON
            newSteps[index] = { ...newSteps[index], content: jsonString };
            setSteps(newSteps);
        } catch (e) {
            // allow typing invalid json
        }
    };

    const addStep = () => {
        const maxOrder = steps.length > 0 ? Math.max(...steps.map(s => s.step_order || 0)) : 0;
        setSteps([...steps, {
            lesson_id: lesson.id,
            step_type: 'teach',
            step_order: maxOrder + 1,
            // Default to teach template
            content: STEP_TEMPLATES['teach']
        }]);
    };

    const removeStep = (index: number) => {
        const stepToRemove = steps[index];
        if (stepToRemove.id) {
            setDeletedStepIds([...deletedStepIds, stepToRemove.id]);
        }
        const newSteps = steps.filter((_, i) => i !== index);
        setSteps(newSteps);
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            // 1. Prepare Content JSON
            const preparedSteps = steps.map((s, index) => {
                let content = s.content;
                // Parse JSON content if it's a string (from textarea)
                if (typeof content === 'string') {
                    try {
                        content = JSON.parse(content);
                    } catch (e) {
                        throw new Error(`Invalid JSON in step #${index + 1}`);
                    }
                }

                // Ensure the step has the correct structure for the JSON
                return {
                    type: s.step_type || 'teach', // Use the state's step_type
                    content: content
                };
            });

            const lessonContent = {
                type: 'structured',
                steps: preparedSteps
            };

            // 2. Update Lesson in DB
            const { error: lessonError } = await supabase
                .from('lessons') // Correct table name
                .update({
                    title: lesson.title,
                    description: lesson.description,
                    xp_reward: lesson.xp_reward,
                    // content: lessonContent -- disabling content update for now if we want to be safe, but actually we WANT to update it.
                    content: lessonContent,
                    updated_at: new Date().toISOString()
                })
                .eq('id', lesson.id);

            if (lessonError) throw lessonError;

            setMessage({ type: 'success', text: 'Lesson saved successfully!' });
            // Reload
            if (lesson.id) loadLesson(lesson.id);
            setDeletedStepIds([]);

        } catch (error: any) {
            console.error('Error saving lesson:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to save' });
        } finally {
            setSaving(false);
            // setDeletedStepIds([]); // No longer needed
        }
    };

    if (loading) return (
        <>
            <Head>
                <title>Edit Lesson</title>
            </Head>
            <DashboardLayout>Loading...</DashboardLayout>
        </>
    );

    return (
        <>
            <Head>
                <title>{`Edit Lesson: ${lesson.title}`}</title>
            </Head>
            <DashboardLayout>
                <div className="mb-6">
                    <Link href="/dashboard/lessons" className="text-secondary hover:underline">&larr; Back to Lessons</Link>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-foreground">Edit Lesson</h1>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn btn-primary"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {message && (
                    <div className={`p-4 mb-6 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Lesson Metadata */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="dashboard-card bg-card border-border p-6 rounded-lg sticky top-6">
                            <h2 className="text-xl font-bold mb-4 text-foreground">Lesson Details</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-muted-foreground">Title</label>
                                    <input
                                        type="text"
                                        className="form-input w-full bg-background border-border text-foreground"
                                        value={lesson.title || ''}
                                        onChange={e => handleLessonChange('title', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-muted-foreground">Description</label>
                                    <textarea
                                        className="form-input w-full bg-background border-border text-foreground min-h-[100px]"
                                        value={lesson.description || ''}
                                        onChange={e => handleLessonChange('description', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-muted-foreground">Complexity Score</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="form-input w-full bg-background border-border text-foreground"
                                            value={lesson.complexity || 1.0}
                                            onChange={e => handleLessonChange('complexity', parseFloat(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-muted-foreground">XP Reward</label>
                                        <input
                                            type="number"
                                            className="form-input w-full bg-background border-border text-foreground"
                                            value={lesson.xp_reward || ''}
                                            onChange={e => handleLessonChange('xp_reward', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Steps Manager */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-foreground">Lesson Steps ({steps.length})</h2>
                            <button onClick={addStep} className="btn btn-sm btn-secondary">+ Add Step</button>
                        </div>

                        <div className="space-y-6">
                            {steps.map((step, index) => (
                                <div key={index} className="dashboard-card bg-card border-border p-6 rounded-lg relative">
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <div className="px-2 py-1 bg-secondary rounded text-xs text-muted-foreground">
                                            Order: {index + 1}
                                        </div>
                                        <button
                                            onClick={() => removeStep(index)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                            title="Delete Step"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Type</label>
                                            <select
                                                className="form-input w-full bg-background border-border text-foreground py-1"
                                                value={step.step_type}
                                                onChange={e => handleStepChange(index, 'step_type', e.target.value)}
                                            >
                                                <option value="teach">Teach</option>
                                                <option value="quiz_easy">Quiz Easy</option>
                                                <option value="quiz_hard">Quiz Hard</option>
                                                <option value="speak">Speak</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Content (JSON)</label>
                                        <textarea
                                            className={`form-input w-full bg-background border-border text-foreground font-mono text-sm min-h-[150px] ${(typeof step.content === 'string' &&
                                                (() => { try { JSON.parse(step.content); return false; } catch { return true; } })())
                                                ? 'border-red-500 ring-1 ring-red-500' : ''
                                                }`}
                                            value={typeof step.content === 'string' ? step.content : JSON.stringify(step.content, null, 2)}
                                            onChange={e => handleContentChange(index, e.target.value)}
                                        />

                                        {typeof step.content === 'string' && (() => {
                                            try {
                                                JSON.parse(step.content);
                                                return null;
                                            } catch (e: any) {
                                                return <p className="text-xs text-red-500 mt-1">Invalid JSON: {e.message}</p>;
                                            }
                                        })()}

                                        <p className="text-xs text-muted-foreground mt-1">
                                            Edit the JSON content for this step. Ensure it is valid JSON before saving.
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {steps.length === 0 && (
                                <div className="text-center py-10 bg-card border border-border border-dashed rounded-lg text-muted-foreground">
                                    No steps in this lesson yet. Click "Add Step" to begin.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};

export default EditLessonPage;
