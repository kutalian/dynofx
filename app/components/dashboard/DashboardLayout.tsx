'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DashboardLayoutProps {
    children: React.ReactNode;
    userName?: string;
    userLevel?: number;
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

export default function DashboardLayout({
    children,
    userName = 'User',
    userLevel = 1
}: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    const getInitials = (name: string) => {
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Inline styles designed to be bulletproof
    const styles = {
        wrapper: {
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: '#f1f5f9',
        } as React.CSSProperties,
        sidebar: {
            position: 'fixed' as const,
            left: 0,
            top: 0,
            width: '260px',
            height: '100vh',
            backgroundColor: 'white',
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column' as const,
            zIndex: 100,
            transition: 'transform 0.3s',
        } as React.CSSProperties,
        sidebarHeader: {
            padding: '1.5rem',
            borderBottom: '1px solid #e2e8f0',
        } as React.CSSProperties,
        logo: {
            fontSize: '1.5rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
        } as React.CSSProperties,
        navMenu: {
            flex: 1,
            padding: '1rem 0',
            overflowY: 'auto' as const,
        } as React.CSSProperties,
        navSection: {
            marginBottom: '2rem',
        } as React.CSSProperties,
        navSectionTitle: {
            padding: '0.5rem 1.5rem',
            fontSize: '0.75rem',
            textTransform: 'uppercase' as const,
            letterSpacing: '1px',
            color: '#64748b',
            fontWeight: 600,
        } as React.CSSProperties,
        navItem: (isActive: boolean) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1.5rem',
            color: isActive ? '#7c3aed' : '#334155',
            textDecoration: 'none',
            fontWeight: isActive ? 600 : 400,
            background: isActive ? 'linear-gradient(90deg, rgba(124, 58, 237, 0.1) 0%, transparent 100%)' : 'transparent',
            borderLeft: isActive ? '3px solid #7c3aed' : '3px solid transparent',
            transition: 'all 0.2s',
        } as React.CSSProperties),
        navIcon: {
            fontSize: '1.25rem',
            width: '24px',
            textAlign: 'center' as const,
        } as React.CSSProperties,
        badge: {
            marginLeft: 'auto',
            padding: '0.25rem 0.5rem',
            backgroundColor: '#ef4444',
            color: 'white',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 600,
        } as React.CSSProperties,
        sidebarFooter: {
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
        } as React.CSSProperties,
        userProfile: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            borderRadius: '12px',
        } as React.CSSProperties,
        userAvatar: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: '1rem',
        } as React.CSSProperties,
        userInfo: {
            flex: 1,
        } as React.CSSProperties,
        userName: {
            fontWeight: 600,
            fontSize: '0.9rem',
            color: '#1e1b4b',
        } as React.CSSProperties,
        userRole: {
            fontSize: '0.75rem',
            color: '#64748b',
        } as React.CSSProperties,
        mainContent: {
            marginLeft: '260px',
            flex: 1,
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column' as const,
        } as React.CSSProperties,
        topbar: {
            backgroundColor: 'white',
            borderBottom: '1px solid #e2e8f0',
            padding: '1rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '2rem',
            position: 'sticky' as const,
            top: 0,
            zIndex: 50,
        } as React.CSSProperties,
        searchBar: {
            flex: 1,
            maxWidth: '500px',
            position: 'relative' as const,
        } as React.CSSProperties,
        searchInput: {
            width: '100%',
            padding: '0.75rem 1rem 0.75rem 2.75rem',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '0.95rem',
            outline: 'none',
        } as React.CSSProperties,
        searchIcon: {
            position: 'absolute' as const,
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#64748b',
            fontSize: '1.25rem',
        } as React.CSSProperties,
        topbarActions: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
        } as React.CSSProperties,
        iconBtn: {
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative' as const,
            fontSize: '1.25rem',
        } as React.CSSProperties,
        badgeDot: {
            position: 'absolute' as const,
            top: '8px',
            right: '8px',
            width: '8px',
            height: '8px',
            backgroundColor: '#ef4444',
            borderRadius: '50%',
            border: '2px solid white',
        } as React.CSSProperties,
        btnPrimary: {
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95rem',
            textDecoration: 'none',
        } as React.CSSProperties,
        mobileMenuBtn: {
            display: 'none',
            width: '40px',
            height: '40px',
            backgroundColor: '#f1f5f9',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1.25rem',
            alignItems: 'center',
            justifyContent: 'center',
        } as React.CSSProperties,
        content: {
            padding: '2rem',
            flex: 1,
        } as React.CSSProperties,
    };

    return (
        <div style={styles.wrapper}>
            {/* Sidebar */}
            <aside style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                    <Link href="/" style={styles.logo}>
                        <span>🚀</span> DynoFX
                    </Link>
                </div>

                <nav style={styles.navMenu}>
                    <div style={styles.navSection}>
                        <div style={styles.navSectionTitle}>Main</div>
                        {navItems.main.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={styles.navItem(pathname === item.href)}
                            >
                                <span style={styles.navIcon}>{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>

                    <div style={styles.navSection}>
                        <div style={styles.navSectionTitle}>Learning</div>
                        {navItems.learning.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={styles.navItem(pathname === item.href)}
                            >
                                <span style={styles.navIcon}>{item.icon}</span>
                                <span>{item.label}</span>
                                {item.badge && <span style={styles.badge}>{item.badge}</span>}
                            </Link>
                        ))}
                    </div>

                    <div style={styles.navSection}>
                        <div style={styles.navSectionTitle}>Account</div>
                        {navItems.account.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={styles.navItem(pathname === item.href)}
                            >
                                <span style={styles.navIcon}>{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </nav>

                <div style={styles.sidebarFooter}>
                    <div style={styles.userProfile}>
                        <div style={styles.userAvatar}>{getInitials(userName)}</div>
                        <div style={styles.userInfo}>
                            <div style={styles.userName}>{userName}</div>
                            <div style={styles.userRole}>Level {userLevel} Trader</div>
                        </div>
                        <span style={{ fontSize: '1.25rem', cursor: 'pointer' }}>⋮</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main style={styles.mainContent}>
                {/* Topbar */}
                <div style={styles.topbar}>
                    <button
                        style={styles.mobileMenuBtn}
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Toggle menu"
                    >
                        ☰
                    </button>

                    <div style={styles.searchBar}>
                        <span style={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search trades, courses, or symbols..."
                            style={styles.searchInput}
                        />
                    </div>

                    <div style={styles.topbarActions}>
                        <button style={styles.iconBtn} aria-label="Notifications">
                            🔔
                            <span style={styles.badgeDot}></span>
                        </button>
                        <button style={styles.iconBtn} aria-label="Messages">
                            💬
                        </button>
                        <Link href="/dashboard/trading" style={styles.btnPrimary}>
                            + New Trade
                        </Link>
                    </div>
                </div>

                {/* Content */}
                <div style={styles.content}>
                    {children}
                </div>
            </main>
        </div>
    );
}
