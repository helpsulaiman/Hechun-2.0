import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '../../components/DashboardLayout';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

interface LearningLesson {
    id: number;
    level_id: number;
    title: string;
    description: string;
    type: string;
    xp_reward: number;
    lesson_order: number;
    icon_name: string;
    color: string;
}

const ManageLessonsPage: React.FC = () => {
    const supabase = useSupabaseClient();
    const [lessons, setLessons] = useState<LearningLesson[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchLessons = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('learning_lessons')
                .select('*')
                .order('id', { ascending: true });

            if (error) throw error;
            setLessons(data || []);
        } catch (error) {
            console.error('Failed to fetch lessons', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLessons();
    }, []);

    const router = useRouter(); // You'll need to add useRouter hook

    // Navigate to the editor page
    const handleEdit = (lesson: LearningLesson) => {
        router.push(`/dashboard/lessons/${lesson.id}`);
    };

    // Placeholder for handleDelete
    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this lesson?')) return;
        try {
            const { error } = await supabase.from('learning_lessons').delete().eq('id', id);
            if (error) throw error;
            fetchLessons();
        } catch (error: any) {
            console.error('Error deleting lesson', error);
            alert('Failed to delete lesson: ' + error.message);
        }
    };

    return (
        <>
            <Head>
                <title>Manage Lessons</title>
            </Head>
            <DashboardLayout>
                <div className="flex justify-between items-center mb-8" style={{ marginBottom: '2rem' }}>
                    <h1 className="text-3xl font-bold text-foreground">Manage Learning Lessons</h1>
                    <button
                        className="btn btn-primary"
                        onClick={() => alert("Add functionality to be implemented")}
                    >
                        + Add New Lesson
                    </button>
                </div>

                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search lessons..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input bg-background text-foreground border-border"
                    />
                </div>

                <div className="dashboard-grid">
                    {isLoading ? <p className="text-muted-foreground">Loading lessons...</p> : lessons
                        .filter(l => l.title.toLowerCase().includes(searchTerm.toLowerCase()) || l.description.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((lesson) => (
                            <div key={lesson.id} className="dashboard-card bg-card border-border">
                                <div className="mb-2">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-1 rounded">
                                            Level {lesson.level_id}
                                        </span>
                                        <span className="text-xs font-bold text-primary">
                                            {lesson.xp_reward} XP
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground mb-1">{lesson.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{lesson.description}</p>
                                </div>
                                <div className="flex justify-end gap-2 mt-auto pt-2 border-t border-border">
                                    <button onClick={() => handleEdit(lesson)} className="btn btn-sm btn-secondary">Edit</button>
                                    <button onClick={() => handleDelete(lesson.id)} className="btn btn-sm btn-danger text-white bg-destructive hover:bg-destructive/90">Delete</button>
                                </div>
                            </div>
                        ))}
                </div>
            </DashboardLayout>
        </>
    );
};

export default ManageLessonsPage;