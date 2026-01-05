import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const FeedbackButton: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const menuItems = [
        {
            label: "Having an Issue?",
            icon: "fas fa-bug",
            href: "https://github.com/helpsulaiman/Hechun-2.0/issues/new",
            color: "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        },
        {
            label: "Contact Us",
            icon: "fas fa-envelope",
            href: "mailto:dydspirit@gmail.com",
            color: "text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        },
        {
            label: "Support us",
            icon: "fas fa-coffee",
            href: "https://buymeacoffee.com/helpsulaiman",
            color: "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
        }
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end" ref={menuRef}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="mb-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden min-w-[200px]"
                    >
                        <div className="flex flex-col py-1">
                            {menuItems.map((item, index) => (
                                <a
                                    key={index}
                                    href={item.href}
                                    target={item.href.startsWith('mailto:') ? undefined : "_blank"}
                                    rel={item.href.startsWith('mailto:') ? undefined : "noopener noreferrer"}
                                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${item.color} hover:bg-opacity-50 dark:text-slate-200`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <i className={`${item.icon} w-5 text-center`}></i>
                                    {item.label}
                                </a>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center w-14 h-14 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:scale-105 transition-all duration-200 group ${isOpen ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-900' : ''}`}
                aria-label="Open feedback menu"
            >
                <div className="grid place-items-center w-6 h-6">
                    <i className={`fas fa-comment-dots col-start-1 row-start-1 text-xl leading-none transition-all duration-300 ${isOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`}></i>
                    <i className={`fas fa-times col-start-1 row-start-1 text-xl leading-none transition-all duration-300 ${isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`}></i>
                </div>
            </button>
        </div>
    );
};

export default FeedbackButton;
