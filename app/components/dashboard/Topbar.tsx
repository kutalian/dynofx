'use client';

import Link from 'next/link';

interface TopbarProps {
    onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
    return (
        <div className="topbar">
            <button
                className="mobile-menu-btn"
                onClick={onMenuClick}
                aria-label="Toggle menu"
            >
                ☰
            </button>

            <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    placeholder="Search trades, courses, or symbols..."
                />
            </div>

            <div className="topbar-actions">
                <button className="icon-btn" aria-label="Notifications">
                    🔔
                    <span className="badge-dot"></span>
                </button>
                <button className="icon-btn" aria-label="Messages">
                    💬
                </button>
                <Link href="/dashboard/trading" className="btn-primary topbar-btn">
                    + New Trade
                </Link>
            </div>
        </div>
    );
}
