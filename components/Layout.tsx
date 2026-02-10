import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useConvexAuth } from 'convex/react';
import { useAuth0 } from '@auth0/auth0-react';
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
    keywords?: string;
    ogImage?: string;
    noIndex?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
    children,
    title = 'Hečhun - Learn Kashmiri Language',
    description = 'Hečhun is the best platform to learn Kashmiri (Koshur) online. Adaptive lessons for reading, writing, and speaking Kashmiri.',
    fullWidth = false,
    keywords = 'Learn kashmiri, hechun, kashmiri language, kashwords, hečhun, learn koshur',
    ogImage = 'https://hechun.tech/hechun_logo/hechun_full_lm.png',
    noIndex = false
}) => {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useConvexAuth();
    const { user, loginWithRedirect } = useAuth0(); // Add loginWithRedirect
    const [isAdmin, setIsAdmin] = useState(false);
    const [streak, setStreak] = useState(0);

    // Guest mode check
    const isGuest = typeof window !== 'undefined' && localStorage.getItem('hechun_guest_onboarding') === 'true';

    const siteUrl = 'https://hechun.tech';
    const canonicalUrl = `${siteUrl}${router.asPath}`;

    // Schema.org Structured Data
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Hečhun",
        "alternateName": ["Hechun", "Kashmiri Learning"],
        "url": siteUrl,
        "description": description,
        "potentialAction": {
            "@type": "SearchAction",
            "target": `${siteUrl}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string"
        }
    };

    // Check admin status and fetch streak when user changes available
    useEffect(() => {
        // TODO: Replace this with Convex query to check if user is admin
        setIsAdmin(false);
        setStreak(0);
    }, [user]);

    const menuItems: Array<{
        label: string;
        href?: string;
        onClick?: () => void;
        rotation: number;
        hoverStyles: { bgColor: string; textColor: string; };
        ariaLabel?: string;
    }> = useMemo(() => {
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
                onClick: () => {
                    loginWithRedirect({
                        appState: {
                            returnTo: router.asPath, // Return to current page after login
                        },
                    });
                },
                rotation: 8,
                hoverStyles: { bgColor: '#ef4444', textColor: '#ffffff' } // Red
            });
        }

        return items;
    }, [user, isAdmin, router, loginWithRedirect, isGuest]);

    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="keywords" content={keywords} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />

                {/* NoIndex for sensitive pages */}
                {noIndex && <meta name="robots" content="noindex, nofollow" />}

                {/* Canonical URL */}
                <link rel="canonical" href={canonicalUrl} />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:image" content={ogImage} />
                <meta property="og:site_name" content="Hečhun" />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content={canonicalUrl} />
                <meta property="twitter:title" content={title} />
                <meta property="twitter:description" content={description} />
                <meta property="twitter:image" content={ogImage} />

                {/* Structured Data - WebSite */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />

                {/* Structured Data - Organization (For Logo) */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Organization",
                            "name": "Hečhun",
                            "url": siteUrl,
                            "logo": "https://hechun.tech/hechun_logo/hechun_full_lm.png"
                        })
                    }}
                />

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
                            items={menuItems}
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