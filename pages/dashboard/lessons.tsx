
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/DashboardLayout';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { BookOpen, Layers, Edit2, Trash2, Plus } from 'lucide-react';
import { LearningLesson } from '../../types/learning';
import { Id } from '../../convex/_generated/dataModel';

// Group definitions
const COMPLEXITY_GROUPS = [
    { id: 'beginner', label: 'Beginner (1-2)', min: 0, max: 2.9, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    { id: 'intermediate', label: 'Intermediate (3-4)', min: 3.0, max: 4.9, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    { id: 'advanced', label: 'Advanced (5+)', min: 5.0, max: 10, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
];

const ManageLessonsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('beginner');
    const router = useRouter();

    // Queries
    const rwLessons = useQuery(api.lessons_new.getLessonsForSkill, { skill: 'reading_writing' }) || [];
    const speakLessons = useQuery(api.lessons_new.getLessonsForSkill, { skill: 'speaking' }) || [];
    const grammarLessons = useQuery(api.lessons_new.getLessonsForSkill, { skill: 'grammar' }) || [];
    const vocabLessons = useQuery(api.lessons_new.getLessonsForSkill, { skill: 'vocabulary' }) || [];

    // Combine all lessons (or just filter by skill if you want)
    // For this generic dashboard, we might want to show ALL, or add a skill filter.
    // Assuming this dashboard was for ALL lessons mixed.
    const allLessons = [...rwLessons, ...speakLessons, ...grammarLessons, ...vocabLessons];

    // Mutations
    const deleteLesson = useMutation(api.lessons_new.deleteLessonForSkill);
    const createLesson = useMutation(api.lessons_new.createLessonForSkill);


    // No manual fetch needed with useQuery

    // Filter lessons by active tab complexity
    const filteredLessons = allLessons.filter((lesson: any) => {
        const group = COMPLEXITY_GROUPS.find(g => g.id === activeTab);
        if (!group) return false;
        return (lesson.complexity || 1) >= group.min && (lesson.complexity || 1) <= group.max;
    });



    const handleDelete = async (id: string, skill: string = 'reading_writing') => {
        if (!confirm('Are you sure you want to delete this lesson?')) return;

        try {
            await deleteLesson({ lessonId: id as Id<"lessons_reading_writing"> }); // Cast for now, dynamic tables handled in backend
        } catch (e) {
            console.error(e);
            alert('Error deleting lesson');
        }
    };

    const handleEdit = (id: string, skill: string = 'reading_writing') => {
        // We need skill in URL to know which table to query
        router.push(`/dashboard/lessons/edit/${skill}/${id}`);
    };

    const handleCreateLesson = async () => {
        // For new system, we just redirect to a create form where they pick skill
        router.push(`/dashboard/lessons/create`);
    };

    return (
        <DashboardLayout>
            <Head>
                <title>Manage Lessons - Hechun Admin</title>
            </Head>

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <Layers className="w-8 h-8 text-indigo-500" />
                            Manage Lessons
                        </h1>
                        <p className="text-gray-400 mt-1">Organize and edit learning content by complexity.</p>
                    </div>
                    <button
                        onClick={handleCreateLesson}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="w-4 h-4" />
                        New Lesson
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/10">
                    {COMPLEXITY_GROUPS.map(group => (
                        <button
                            key={group.id}
                            onClick={() => setActiveTab(group.id)}
                            className={`
                                px-4 py-2 rounded-t-lg font-medium transition-all whitespace-nowrap relative
                                ${activeTab === group.id ? 'text-white bg-white/5 border-b-2 ' + group.color.replace('text-', 'border-') : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
                            `}
                        >
                            {group.label}
                            {activeTab === group.id && (
                                <span className={`absolute bottom-0 left-0 w-full h-0.5 ${group.color.replace('text-', 'bg-')}`}></span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="min-h-[400px]">
                    {filteredLessons.length === 0 ? (
                        <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-300">No lessons found</h3>
                            <p className="text-gray-500 mt-2">There are no lessons in this complexity range yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredLessons.map((lesson: any) => (
                                <div
                                    key={lesson._id}
                                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-all group flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="bg-gray-800 rounded-lg w-12 h-12 flex items-center justify-center flex-shrink-0 font-mono text-gray-400 font-bold border border-white/5">
                                            {lesson.lesson_order}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-200 group-hover:text-indigo-400 transition-colors">
                                                {lesson.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 line-clamp-1">{lesson.description}</p>
                                            <div className="flex items-center gap-3 mt-2 text-xs font-mono">
                                                <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">
                                                    Order: {lesson.lesson_order}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded ${COMPLEXITY_GROUPS.find(g => g.id === activeTab)?.bg || 'bg-gray-700'
                                                    } ${COMPLEXITY_GROUPS.find(g => g.id === activeTab)?.color || 'text-gray-300'}`}>
                                                    Complexity: {lesson.complexity}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                        <button
                                            onClick={() => handleEdit(lesson._id, 'reading_writing')} // Todo: dynamic skill
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(lesson._id, 'reading_writing')} // Todo: dynamic skill
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ManageLessonsPage;
