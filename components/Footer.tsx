import React from 'react';
import { Mail, Github, Twitter, Instagram, Heart } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="w-full border-t border-border/20 bg-secondary mt-auto">
            <div className="container mx-auto px-4 pt-20 pb-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">

                    {/* Brand */}
                    <div className="flex flex-col items-center md:items-start space-y-2">
                        <h3 className="text-2xl font-bold text-primary tracking-tight">
                            Hečhun 2.0
                        </h3>
                        <p className="text-sm text-secondary-foreground/80 leading-relaxed max-w-xs">
                            Hečhun creates a personalized learning path adapting to your unique skill level in Reading, Writing, and Speaking.
                        </p>
                    </div>

                    {/* Quick Links (Center column example - or just filler) */}
                    <div className="flex flex-col space-y-2 text-sm text-secondary-foreground/70">
                        {/* Could add navigation links here if desired, otherwise keeping it clean */}
                    </div>

                    {/* Social Links */}
                    <div className="flex justify-center md:justify-end gap-4">
                        <a
                            href="mailto:dydspirit@gmail.com"
                            className="bg-primary/10 hover:bg-primary/20 text-primary p-3 rounded-full transition-all duration-300 hover:scale-110"
                            aria-label="Email"
                        >
                            <Mail size={18} />
                        </a>
                        <a
                            href="https://github.com/helpsulaiman/Hechun-2.0.git"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary/10 hover:bg-primary/20 text-primary p-3 rounded-full transition-all duration-300 hover:scale-110"
                            aria-label="GitHub"
                        >
                            <Github size={18} />
                        </a>
                        <a
                            href="https://instagram.com/helpsulaiman"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary/10 hover:bg-primary/20 text-primary p-3 rounded-full transition-all duration-300 hover:scale-110"
                            aria-label="Instagram"
                        >
                            <Instagram size={18} />
                        </a>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/20 my-4" />

                {/* Bottom Credit */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-secondary-foreground/60">
                    <p>© 2026 Hečhun 2.0. Preserving Culture.</p>

                    <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/20 border border-white/5">
                        <span>Built with</span>
                        <Heart size={10} className="text-red-500 fill-current" />
                        <span>by</span>
                        <a
                            href="https://github.com/helpsulaiman"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-white transition-colors font-medium hover:underline"
                        >
                            helpsulaiman
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
