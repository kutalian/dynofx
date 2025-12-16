'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface DashboardShellProps {
    children: React.ReactNode;
    userName: string;
    userLevel: number;
}

const navItems = {
    main: [
        { icon: '📊', label: 'Dashboard', href: '/dashboard' },
        { icon: '💼', label: 'Portfolio', href: '/dashboard/portfolio' },
        { icon: '📈', label: 'Trading', href: '/dashboard/trading' },
        { icon: '📜', label: 'Trade History', href: '/dashboard/history' },
    ],
    learning: [
        { icon: '🎓', label: 'Courses', href: '/dashboard/courses' },
        { icon: '📚', label: 'Lessons', href: '/dashboard/lessons', badge: 3 },
        { icon: '🏆', label: 'Achievements', href: '/dashboard/achievements' },
        { icon: '👥', label: 'Leaderboard', href: '/dashboard/leaderboard' },
    ],
    account: [
        { icon: '⚙️', label: 'Settings', href: '/dashboard/settings' },
        { icon: '❓', label: 'Help & Support', href: '/dashboard/help' },
    ],
};

export default function DashboardShell({ children, userName, userLevel }: DashboardShellProps) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    // Only render after mount to prevent hydration issues
    useEffect(() => {
        setMounted(true);
    }, []);

    const getInitials = (name: string) => {
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (!mounted) {
        // Return a loading placeholder that matches server render
        return (
            <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#64748b' }}>Loading...</div>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: '#f1f5f9',
        }}>
            {/* Sidebar */}
            <aside style={{
                width: '260px',
                minWidth: '260px',
                height: '100vh',
                background: 'white',
                borderRight: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                left: 0,
                top: 0,
                zIndex: 100,
            }}>
                {/* Logo */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                    <Link href="/" style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}>
                        🚀 DynoFX
                    </Link>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
                    {/* Main Section */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ padding: '0.5rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: 600 }}>
                            Main
                        </div>
                        {navItems.main.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link key={item.href} href={item.href} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1.5rem',
                                    color: isActive ? '#7c3aed' : '#334155',
                                    textDecoration: 'none',
                                    fontWeight: isActive ? 600 : 400,
                                    background: isActive ? 'linear-gradient(90deg, rgba(124, 58, 237, 0.1) 0%, transparent 100%)' : 'transparent',
                                    borderLeft: isActive ? '3px solid #7c3aed' : '3px solid transparent',
                                }}>
                                    <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Learning Section */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ padding: '0.5rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: 600 }}>
                            Learning
                        </div>
                        {navItems.learning.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link key={item.href} href={item.href} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1.5rem',
                                    color: isActive ? '#7c3aed' : '#334155',
                                    textDecoration: 'none',
                                    fontWeight: isActive ? 600 : 400,
                                    background: isActive ? 'linear-gradient(90deg, rgba(124, 58, 237, 0.1) 0%, transparent 100%)' : 'transparent',
                                    borderLeft: isActive ? '3px solid #7c3aed' : '3px solid transparent',
                                }}>
                                    <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                                    <span>{item.label}</span>
                                    {item.badge && (
                                        <span style={{ marginLeft: 'auto', padding: '0.25rem 0.5rem', background: '#ef4444', color: 'white', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Account Section */}
                    <div>
                        <div style={{ padding: '0.5rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: 600 }}>
                            Account
                        </div>
                        {navItems.account.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link key={item.href} href={item.href} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1.5rem',
                                    color: isActive ? '#7c3aed' : '#334155',
                                    textDecoration: 'none',
                                    fontWeight: isActive ? 600 : 400,
                                    background: isActive ? 'linear-gradient(90deg, rgba(124, 58, 237, 0.1) 0%, transparent 100%)' : 'transparent',
                                    borderLeft: isActive ? '3px solid #7c3aed' : '3px solid transparent',
                                }}>
                                    <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* User Profile */}
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '12px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                        }}>
                            {getInitials(userName)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e1b4b' }}>{userName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Level {userLevel} Trader</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div style={{
                marginLeft: '260px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
            }}>
                {/* Topbar */}
                <header style={{
                    background: 'white',
                    borderBottom: '1px solid #e2e8f0',
                    padding: '1rem 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                }}>
                    <div style={{ flex: 1, maxWidth: '500px', position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '1.25rem' }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search trades, courses, or symbols..."
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 2.75rem',
                                border: '2px solid #e2e8f0',
                                borderRadius: '12px',
                                fontSize: '0.95rem',
                                outline: 'none',
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            border: 'none',
                            background: '#f1f5f9',
                            cursor: 'pointer',
                            fontSize: '1.25rem',
                            position: 'relative',
                        }}>
                            🔔
                            <span style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                width: '8px',
                                height: '8px',
                                background: '#ef4444',
                                borderRadius: '50%',
                                border: '2px solid white',
                            }}></span>
                        </button>
                        <button style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            border: 'none',
                            background: '#f1f5f9',
                            cursor: 'pointer',
                            fontSize: '1.25rem',
                        }}>
                            💬
                        </button>
                        <Link href="/dashboard/trading" style={{
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            textDecoration: 'none',
                        }}>
                            + New Trade
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main style={{ flex: 1, padding: '2rem' }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
