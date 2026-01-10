import React from 'react';
import { Mail, Github, Instagram, Heart, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="w-full border-t border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-black/40 backdrop-blur-xl relative overflow-hidden py-6">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl translate-y-1/3 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">

                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-2 space-y-2">
                        <Link href="/" className="inline-block group">
                            <h3 className="text-2xl font-bold text-zinc-800 dark:text-white tracking-tight group-hover:text-primary transition-all duration-300">
                                Hečhun 2.0
                            </h3>
                        </Link>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-sm text-sm">
                            Preserving the rich cultural heritage of Kashmir through language.
                            A personalized learning path adapting to your unique skill level in Reading, Writing, and Speaking.
                        </p>

                        <div className="flex gap-4 pt-1">
                            <SocialLink href="mailto:dydspirit@gmail.com" icon={<Mail size={16} />} label="Email" />
                            <SocialLink href="https://github.com/helpsulaiman/Hechun-2.0.git" icon={<Github size={16} />} label="GitHub" />
                            <SocialLink href="https://instagram.com/helpsulaiman" icon={<Instagram size={16} />} label="Instagram" />
                        </div>
                    </div>

                    {/* Explore Links */}
                    <div className="col-span-1">
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-white/90 uppercase tracking-wider mb-3">Explore</h4>
                        <ul className="space-y-2">
                            <FooterLink href="/" label="Home" />
                            <FooterLink href="/history" label="Lesson History" />
                            <FooterLink href="/leaderboard" label="Leaderboard" />
                            <FooterLink href="/profile" label="Your Profile" />
                        </ul>
                    </div>

                    {/* About Links */}
                    <div className="col-span-1">
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-white/90 uppercase tracking-wider mb-3">About</h4>
                        <ul className="space-y-2">
                            <FooterLink href="/about-project" label="The Project" />
                            <FooterLink href="/about-us" label="Our Team" />
                            {/* Placeholder for future links */}
                            <li className="text-sm text-zinc-400 dark:text-zinc-600 cursor-not-allowed">Community (Coming Soon)</li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-zinc-200 dark:bg-white/10 mb-4" />

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-zinc-500 dark:text-zinc-500">
                    <p>© 2026 Hečhun 2.0. All rights reserved.</p>

                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors duration-300">
                        <span>Built with</span>
                        <Heart size={12} className="text-rose-500 fill-rose-500 animate-pulse" />
                        <span>by</span>
                        <a
                            href="https://github.com/helpsulaiman"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors font-medium flex items-center gap-1 group"
                        >
                            helpsulaiman
                            <ArrowRight size={10} className="-ml-1 opacity-0 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

// Helper Components for cleaner code
const FooterLink = ({ href, label }: { href: string; label: string }) => (
    <li>
        <Link href={href} className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
            <span className="w-1 h-1 rounded-full bg-primary/0 group-hover:bg-primary transition-all duration-200" />
            <span className="group-hover:translate-x-1 transition-transform duration-200">{label}</span>
        </Link>
    </li>
);

const SocialLink = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 hover:scale-110 transition-all duration-300"
        aria-label={label}
    >
        {icon}
    </a>
);

export default Footer;
