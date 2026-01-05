import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import {
    LayoutDashboard,
    BookOpen,
    Lightbulb,
    Languages,
    GraduationCap,
    Users,
    LogOut,
    Hexagon,
    Menu,
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

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
                    glass-effect fixed md:static inset-y-0 left-0 z-50 flex flex-col h-full border-r border-white/10 transition-all duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    ${isCollapsed ? 'w-20' : 'w-64'}
                `}
            >
                {/* Header */}
                <div className={`h-20 flex items-center ${isCollapsed ? 'justify-center' : 'px-6'} border-b border-white/10 relative`}>
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity overflow-hidden">
                        <Hexagon className="w-8 h-8 text-indigo-400 flex-shrink-0" />
                        {!isCollapsed && <span className="text-xl font-bold text-white whitespace-nowrap">Hečhun</span>}
                    </Link>

                    {/* Close button for Mobile */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute right-4 md:hidden text-gray-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-grow p-4 space-y-2 overflow-y-auto overflow-x-hidden">
                    {navItems.map(item => {
                        const isActive = router.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)} // Close on mobile navigation
                                className={`
                                    nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 transition-all hover:bg-white/5
                                    ${isActive ? 'active bg-white/10 text-white shadow-sm' : ''}
                                    ${isCollapsed ? 'justify-center' : ''}
                                `}
                                title={isCollapsed ? item.label : undefined}
                            >
                                {item.icon}
                                {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Controls */}
                <div className="p-4 border-t border-white/10 space-y-4">
                    {/* PC Collapse Toggle */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden md:flex items-center justify-center w-full p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>

                    <button
                        onClick={handleLogout}
                        className={`
                            flex items-center gap-3 px-4 py-2 w-full rounded-lg text-gray-300 transition-colors hover:bg-red-500/10 hover:text-red-400 group
                            ${isCollapsed ? 'justify-center px-2' : ''}
                        `}
                        title="Log Out"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0 group-hover:text-red-400" />
                        {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">Log Out</span>}
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
        <div className="h-screen w-full flex bg-gray-900 text-gray-200 font-sans relative overflow-hidden">
            <div className="shape-1 fixed top-0 left-0"></div>
            <div className="shape-2 fixed bottom-0 right-0"></div>

            {/* Mobile Header Trigger */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900/50 backdrop-blur-md border-b border-white/10 flex items-center px-4 z-50 glass-effect">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 text-white hover:bg-white/10 rounded-lg"
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

            <main className="flex-grow p-4 md:p-8 z-0 overflow-y-auto h-full pt-20 md:pt-8 w-full transition-all duration-300">
                <div className="glass-effect rounded-2xl p-4 md:p-8 min-h-max">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;