import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { motion, AnimatePresence } from 'framer-motion';
import BubbleMenu from './BubbleMenu';
import Footer from './Footer';
import FeedbackButton from './ui/FeedbackButton';
import StreakBadge from './ui/StreakBadge';
import ThemeToggle from './ThemeToggle';

import Link from 'next/link';

interface LayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    fullWidth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
    children,
    title = 'Hečhun',
    description = 'Discover traditional Kashmiri idioms and their meanings. Explore our collection of cultural expressions that carry the wisdom of Kashmir.',
    fullWidth = false
}) => {
    const router = useRouter();
    const user = useUser();
    const supabase = useSupabaseClient();
    const [isAdmin, setIsAdmin] = useState(false);
    const [streak, setStreak] = useState(0);

    // Check admin status and fetch streak when user changes available
    useEffect(() => {
        const fetchUserStats = async () => {
            if (!user) {
                // Guest Check
                const hasGuestProgress = typeof window !== 'undefined' && (
                    localStorage.getItem('hechun_guest_skills') ||
                    localStorage.getItem('hechun_guest_progress_counts')
                );

                // Allow guests to see "Profile" and 0 streak (feature request: implement guest dates)
                let guestStreak = 0;
                try {
                    const streakData = localStorage.getItem('hechun_guest_streak');
                    if (streakData) {
                        guestStreak = JSON.parse(streakData).currentStreak || 0;
                    }
                } catch (e) { }

                setIsAdmin(false);
                setStreak(guestStreak);
                return;
            }

            // 1. Check Admin & Streak (Consolidated)
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('is_admin, streak_days')
                .eq('user_id', user.id)
                .maybeSingle();

            setIsAdmin(profile?.is_admin === true);
            setStreak(profile?.streak_days || 0);
        };
        fetchUserStats();
    }, [user, supabase]);

    const navItems = React.useMemo(() => {
        const isGuest = typeof window !== 'undefined' && !!localStorage.getItem('hechun_guest_skills');

        const items = [
            {
                label: 'Home',
                href: '/',
                rotation: -8,
                hoverStyles: { bgColor: '#10b981', textColor: '#ffffff' } // Green
            },
            {
                label: 'Lesson History',
                href: '/history',
                rotation: 8,
                hoverStyles: { bgColor: '#f59e0b', textColor: '#ffffff' } // Amber
            },
            {
                label: 'About Project',
                href: '/about-project',
                rotation: -6,
                hoverStyles: { bgColor: '#8b5cf6', textColor: '#ffffff' } // Purple
            },
            {
                label: 'About Us',
                href: '/about-us',
                rotation: 6,
                hoverStyles: { bgColor: '#06b6d4', textColor: '#ffffff' } // Cyan 
            },
        ];

        // Add Dashboard link for admins
        if (isAdmin) {
            items.push({
                label: 'Dashboard',
                href: '/dashboard',
                rotation: 8,
                hoverStyles: { bgColor: '#dc2626', textColor: '#ffffff' } // Red
            });
        }

        // Add Profile or Login use logic
        if (user || isGuest) {
            items.push({
                label: 'Profile',
                href: '/profile',
                rotation: isAdmin ? -8 : 8,
                hoverStyles: { bgColor: '#ec4899', textColor: '#ffffff' } // Pink 
            });
        } else {
            items.push({
                label: 'Login',
                href: '/auth/login',
                rotation: 8,
                hoverStyles: { bgColor: '#ef4444', textColor: '#ffffff' } // Red
            });
        }

        return items;
    }, [user, isAdmin]);

    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </Head>

            <div className="min-h-screen flex flex-col">
                <header className={`container mx-auto flex pt-4 px-4 z-50 pointer-events-none ${fullWidth ? 'absolute top-0 left-0 right-0' : 'relative'}`}>
                    {/* Pointer events none allows clicking through header if needed, but we need clickable children */}
                    {/* Pointer events none allows clicking through header if needed, but we need clickable children */}
                    <div className="pointer-events-auto">
                        <BubbleMenu
                            logo={
                                <Link href="/" className="h-full flex items-center hover:opacity-80 transition-opacity duration-200 pointer-events-auto">
                                    {/* Light Mode Logo */}
                                    <img
                                        src="/hechun_logo/hechun_illust_lm.png"
                                        alt="Hechun Logo"
                                        className="h-16 md:h-32 w-auto object-contain translate-y-5 md:translate-y-7 dark:hidden block"
                                    />
                                    {/* Dark Mode Logo */}
                                    <img
                                        src="/hechun_logo/hechun_illust_dm.png"
                                        alt="Hechun Logo"
                                        className="h-16 md:h-32 w-auto object-contain translate-y-5 md:translate-y-7 hidden dark:block"
                                    />
                                </Link>
                            }
                            items={navItems}
                            menuAriaLabel="Toggle navigation"
                            menuBg="#ffffff"
                            menuContentColor="#111111"
                            useFixedPosition={true}
                            animationEase="back.out(1.5)"
                            animationDuration={0.5}
                            staggerDelay={0.12}
                        >
                            {/* Streak Badge embedded in Navbar */}
                            <div className="mr-1 md:mr-4 flex items-center gap-1 md:gap-2">
                                <ThemeToggle />
                                <Link href="/leaderboard">
                                    <div className="cursor-pointer hover:scale-105 transition-transform">
                                        <StreakBadge streak={streak} />
                                    </div>
                                </Link>
                            </div>
                        </BubbleMenu>
                    </div>
                </header>

                <main className={`flex-1 w-full min-h-screen ${fullWidth ? '' : 'max-w-[1400px] mx-auto pt-24 sm:pt-32 pb-16'}`}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={router.pathname}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="w-full h-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>

                {!router.pathname.includes('/lesson') && !router.pathname.includes('/diagnostic') && <Footer />}
                {!router.pathname.startsWith('/dashboard') && <FeedbackButton />}
            </div>
        </>
    );
};

export default Layout;