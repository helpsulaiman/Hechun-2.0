import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import {
    LayoutDashboard,
    GraduationCap,
    Users,
    LogOut,
    Hexagon,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Settings
} from 'lucide-react';
import ThemeImage from './ThemeImage'; // Ensure logo consistency
import ThemeToggle from './ThemeToggle';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const navItems = [
    { href: '/dashboard', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5 flex-shrink-0" /> },
    { href: '/dashboard/lessons', label: 'Manage Lessons', icon: <GraduationCap className="w-5 h-5 flex-shrink-0" /> },
    { href: '/dashboard/users', label: 'Manage Users', icon: <Users className="w-5 h-5 flex-shrink-0" /> },
];

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) => {
    const router = useRouter();
    const supabase = useSupabaseClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={`
                    fixed md:static inset-y-0 left-0 z-50 flex flex-col h-full bg-card border-r border-border transition-all duration-300 ease-in-out shadow-xl md:shadow-none
                    ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    ${isCollapsed ? 'w-20' : 'w-64'}
                `}
            >
                {/* Header */}
                <div className={`h-20 flex items-center ${isCollapsed ? 'justify-center' : 'px-6'} border-b border-border relative`}>
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity overflow-hidden">
                        <div className="w-8 h-8 relative flex-shrink-0">
                            <ThemeImage
                                srcLight="https://hdbmcwmgolmxmtllaclx.supabase.co/storage/v1/object/public/images/Hechun_L.png"
                                srcDark="https://hdbmcwmgolmxmtllaclx.supabase.co/storage/v1/object/public/images/Hechun_D.png"
                                alt="Logo"
                                width={32}
                                height={32}
                                className="object-contain"
                            />
                        </div>
                        {!isCollapsed && <span className="text-xl font-bold text-foreground whitespace-nowrap">Hečhun</span>}
                    </Link>

                    {/* Close button for Mobile */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute right-4 md:hidden text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-grow p-4 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-border">
                    {navItems.map(item => {
                        const isActive = router.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                                    ${isActive
                                        ? 'bg-primary text-primary-foreground shadow-md'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }
                                    ${isCollapsed ? 'justify-center' : ''}
                                `}
                                title={isCollapsed ? item.label : undefined}
                            >
                                {item.icon}
                                {!isCollapsed && <span className="whitespace-nowrap overflow-hidden font-medium">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Controls */}
                <div className="p-4 border-t border-border space-y-2">
                    {/* Theme Toggle - Centered if collapsed, aligned if expanded */}
                    <div className={`flex ${isCollapsed ? 'justify-center' : 'justify-start px-2'}`}>
                        <ThemeToggle />
                    </div>

                    {/* PC Collapse Toggle */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden md:flex items-center justify-center w-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
                    >
                        {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>

                    <button
                        onClick={handleLogout}
                        className={`
                            flex items-center gap-3 px-4 py-2 w-full rounded-lg text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-500 group
                            ${isCollapsed ? 'justify-center px-2' : ''}
                        `}
                        title="Log Out"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="whitespace-nowrap overflow-hidden font-medium">Log Out</span>}
                    </button>
                </div>
            </aside>
        </>
    );
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <>
            <Head>
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <div className="h-screen w-full flex bg-background text-foreground font-sans relative overflow-hidden">
                {/* Mobile Header Trigger */}
                <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center px-4 z-40">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="ml-3 font-bold text-lg">Dashboard</span>
                </div>

                <Sidebar
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                />

                <main className="flex-grow relative h-full overflow-y-auto no-scrollbar pt-16 md:pt-0 bg-muted/20">
                    <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-full">
                        {children}
                    </div>
                </main>
            </div>
        </>
    );
};

export default DashboardLayout;