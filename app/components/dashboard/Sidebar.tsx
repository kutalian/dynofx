'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
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

export default function Sidebar({ isOpen, onClose, userName, userLevel }: SidebarProps) {
    const pathname = usePathname();

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const NavItem = ({ item }: { item: { icon: string; label: string; href: string; badge?: number } }) => {
        const isActive = pathname === item.href;
        return (
            <Link
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
            >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && <span className="badge">{item.badge}</span>}
            </Link>
        );
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <Link href="/" className="logo">
                        <span>🚀</span> DynoFX
                    </Link>
                </div>

                <nav className="nav-menu">
                    <div className="nav-section">
                        <div className="nav-section-title">Main</div>
                        {navItems.main.map((item) => (
                            <NavItem key={item.href} item={item} />
                        ))}
                    </div>

                    <div className="nav-section">
                        <div className="nav-section-title">Learning</div>
                        {navItems.learning.map((item) => (
                            <NavItem key={item.href} item={item} />
                        ))}
                    </div>

                    <div className="nav-section">
                        <div className="nav-section-title">Account</div>
                        {navItems.account.map((item) => (
                            <NavItem key={item.href} item={item} />
                        ))}
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="user-avatar">{getInitials(userName)}</div>
                        <div className="user-info">
                            <div className="user-name">{userName}</div>
                            <div className="user-role">Level {userLevel} Trader</div>
                        </div>
                        <span style={{ fontSize: '1.25rem', cursor: 'pointer' }}>⋮</span>
                    </div>
                </div>
            </aside>
        </>
    );
}
