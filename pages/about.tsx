
import React from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import { BookOpen, Star, Users, Github, Heart } from 'lucide-react';

export default function AboutPage() {
    return (
        <Layout title="About Hechun" fullWidth>
            <div className="min-h-screen bg-[var(--bg-body)] text-[var(--text-primary)]">

                {/* Hero Section */}
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px]"></div>
                        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]"></div>
                    </div>

                    <h1 className="relative z-10 text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 mb-6">
                        Hečhun
                    </h1>
                    <p className="relative z-10 text-2xl md:text-3xl text-[var(--text-secondary)] font-serif italic mb-8">
                        "To Learn"
                    </p>
                    <p className="relative z-10 max-w-2xl text-lg text-[var(--text-secondary)] leading-relaxed">
                        Preserving the Kashmiri language through adaptive technology.
                        <br />
                        Hechun is an open-source initiative to make learning Koshur accessible, engaging, and personalized for everyone.
                    </p>
                </div>

                {/* Mission Section */}
                <div className="container mx-auto px-4 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-indigo-500/50 transition-colors">
                            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center mb-6">
                                <Star className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Adaptive Learning</h3>
                            <p className="text-[var(--text-secondary)]">
                                Our intelligent system adapts to your proficiency level in real-time. Whether you are a beginner or looking to polish your skills, Hechun evolves with you.
                            </p>
                        </div>
                        <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-purple-500/50 transition-colors">
                            <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center mb-6">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Cultural Immersion</h3>
                            <p className="text-[var(--text-secondary)]">
                                Language is the key to culture. We integrate proverbs, poetry (Vaakhs), and historical context into every lesson to keep the spirit of Kashmir alive.
                            </p>
                        </div>
                        <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-green-500/50 transition-colors">
                            <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center mb-6">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Community Driven</h3>
                            <p className="text-[var(--text-secondary)]">
                                Built by the community, for the community. We are completely open-source and rely on contributors to expand our curriculum and features.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tech Stack / Open Source */}
                <div className="bg-[var(--bg-card)] border-y border-[var(--border-color)] py-20">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold mb-8">Built with Modern Tech</h2>
                        <div className="flex flex-wrap justify-center gap-4 mb-10">
                            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-mono">Next.js 13</span>
                            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-mono">TypeScript</span>
                            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-mono">Supabase</span>
                            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-mono">Prisma</span>
                            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-mono">TailwindCSS</span>
                        </div>
                        <Link
                            href="https://github.com/helpsulaiman/hechun"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-bold"
                        >
                            <Github className="w-5 h-5" />
                            View on GitHub
                        </Link>
                    </div>
                </div>

                {/* Footer Quote */}
                <div className="py-20 text-center px-4">
                    <blockquote className="text-2xl font-serif italic text-[var(--text-secondary)] mb-6">
                        "Poshe maale karith ne manz czoor.<br />
                        Wale baras peth chui hoor."
                    </blockquote>
                    <p className="text-sm text-gray-500">
                        Made with <Heart className="w-4 h-4 text-red-500 inline mx-1" /> in Kashmir
                    </p>
                </div>

            </div>
        </Layout>
    );
}
