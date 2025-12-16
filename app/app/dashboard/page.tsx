import Link from 'next/link';

// Mock data for the dashboard - will be replaced with real data from Supabase
const statsData = [
    {
        title: 'Virtual Balance',
        value: '$102,456',
        icon: '💰',
        iconBg: 'rgba(124, 58, 237, 0.1)',
        iconColor: '#7c3aed',
        change: '+2.45%',
        positive: true,
        period: 'vs last month',
    },
    {
        title: 'Total P&L',
        value: '+$2,456',
        valueColor: '#10b981',
        icon: '📈',
        iconBg: 'rgba(16, 185, 129, 0.1)',
        iconColor: '#10b981',
        change: '+12.3%',
        positive: true,
        period: 'this week',
    },
    {
        title: 'Win Rate',
        value: '67.5%',
        icon: '🎯',
        iconBg: 'rgba(6, 182, 212, 0.1)',
        iconColor: '#06b6d4',
        change: '+5.2%',
        positive: true,
        period: 'improving',
    },
    {
        title: 'Courses Completed',
        value: '23/50',
        icon: '🎓',
        iconBg: 'rgba(245, 158, 11, 0.1)',
        iconColor: '#f59e0b',
        period: '3 in progress',
    },
];

const recentTrades = [
    { symbol: 'EUR/USD', type: 'buy', time: '2 minutes ago', pnl: '+$234.50', positive: true, size: '0.5 lots' },
    { symbol: 'GBP/JPY', type: 'sell', time: '15 minutes ago', pnl: '-$45.20', positive: false, size: '0.3 lots' },
    { symbol: 'USD/CAD', type: 'buy', time: '1 hour ago', pnl: '+$128.00', positive: true, size: '0.2 lots' },
    { symbol: 'AUD/USD', type: 'sell', time: '3 hours ago', pnl: '+$89.30', positive: true, size: '0.4 lots' },
];

const quickActions = [
    { icon: '📈', text: 'Start Trading', href: '/dashboard/trading' },
    { icon: '🎓', text: 'Learn More', href: '/dashboard/courses' },
    { icon: '🏆', text: 'Competitions', href: '/dashboard/leaderboard' },
    { icon: '📊', text: 'Analytics', href: '/dashboard/analytics' },
];

const recentAchievements = [
    { icon: '🏆', title: 'First Win!', description: 'Completed your first profitable trade', xp: '+50 XP' },
    { icon: '🎯', title: '10 Trades', description: 'Executed 10 simulation trades', xp: '+100 XP' },
];

// Inline styles for dashboard page
const styles = {
    pageHeader: {
        marginBottom: '2rem',
    } as React.CSSProperties,
    pageTitle: {
        fontSize: '2rem',
        fontWeight: 700,
        color: '#1e1b4b',
        marginBottom: '0.5rem',
    } as React.CSSProperties,
    pageSubtitle: {
        color: '#64748b',
    } as React.CSSProperties,
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
    } as React.CSSProperties,
    statCard: {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
        transition: 'all 0.2s',
    } as React.CSSProperties,
    statHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem',
    } as React.CSSProperties,
    statTitle: {
        fontSize: '0.875rem',
        color: '#64748b',
        fontWeight: 500,
        marginBottom: '0.5rem',
    } as React.CSSProperties,
    statValue: {
        fontSize: '2rem',
        fontWeight: 700,
        color: '#1e1b4b',
    } as React.CSSProperties,
    statIcon: (bg: string): React.CSSProperties => ({
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        backgroundColor: bg,
    }),
    statFooter: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.875rem',
    } as React.CSSProperties,
    statChange: (positive: boolean): React.CSSProperties => ({
        fontWeight: 600,
        color: positive ? '#10b981' : '#ef4444',
    }),
    dashboardGrid: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '1.5rem',
        marginBottom: '2rem',
    } as React.CSSProperties,
    card: {
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
    } as React.CSSProperties,
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
    } as React.CSSProperties,
    cardTitle: {
        fontSize: '1.125rem',
        fontWeight: 700,
        color: '#1e1b4b',
    } as React.CSSProperties,
    cardActions: {
        display: 'flex',
        gap: '0.5rem',
    } as React.CSSProperties,
    btnSm: (active: boolean): React.CSSProperties => ({
        padding: '0.5rem 1rem',
        border: '1px solid #e2e8f0',
        backgroundColor: active ? '#7c3aed' : 'white',
        color: active ? 'white' : '#1e1b4b',
        borderRadius: '8px',
        fontSize: '0.875rem',
        cursor: 'pointer',
        fontWeight: 500,
    }),
    chartContainer: {
        height: '300px',
        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05), rgba(6, 182, 212, 0.05))',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    } as React.CSSProperties,
    chartPlaceholder: {
        textAlign: 'center' as const,
        color: '#64748b',
    } as React.CSSProperties,
    quickActions: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem',
    } as React.CSSProperties,
    actionBtn: {
        padding: '1rem',
        border: '2px solid #e2e8f0',
        backgroundColor: 'white',
        borderRadius: '12px',
        cursor: 'pointer',
        textAlign: 'center' as const,
        textDecoration: 'none',
        display: 'block',
        transition: 'all 0.2s',
    } as React.CSSProperties,
    actionIcon: {
        fontSize: '2rem',
        marginBottom: '0.5rem',
    } as React.CSSProperties,
    actionText: {
        fontWeight: 600,
        color: '#1e1b4b',
        fontSize: '0.9rem',
    } as React.CSSProperties,
    achievementList: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '1rem',
    } as React.CSSProperties,
    achievementItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        backgroundColor: '#f1f5f9',
        borderRadius: '12px',
    } as React.CSSProperties,
    achievementIcon: {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
    } as React.CSSProperties,
    achievementInfo: {
        flex: 1,
    } as React.CSSProperties,
    achievementTitle: {
        fontWeight: 600,
        color: '#1e1b4b',
        marginBottom: '0.25rem',
    } as React.CSSProperties,
    achievementDesc: {
        fontSize: '0.85rem',
        color: '#64748b',
    } as React.CSSProperties,
    achievementXp: {
        fontWeight: 700,
        color: '#7c3aed',
    } as React.CSSProperties,
    tradeList: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '0.75rem',
    } as React.CSSProperties,
    tradeItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '1rem',
        backgroundColor: '#f1f5f9',
        borderRadius: '12px',
    } as React.CSSProperties,
    tradeIcon: (type: string): React.CSSProperties => ({
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        marginRight: '1rem',
        fontSize: '0.75rem',
        backgroundColor: type === 'buy' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        color: type === 'buy' ? '#10b981' : '#ef4444',
    }),
    tradeInfo: {
        flex: 1,
    } as React.CSSProperties,
    tradeSymbol: {
        fontWeight: 600,
        color: '#1e1b4b',
        marginBottom: '0.25rem',
    } as React.CSSProperties,
    tradeTime: {
        fontSize: '0.8rem',
        color: '#64748b',
    } as React.CSSProperties,
    tradeAmount: {
        textAlign: 'right' as const,
    } as React.CSSProperties,
    tradePnl: (positive: boolean): React.CSSProperties => ({
        fontWeight: 700,
        fontSize: '1rem',
        color: positive ? '#10b981' : '#ef4444',
    }),
    tradeSize: {
        fontSize: '0.8rem',
        color: '#64748b',
    } as React.CSSProperties,
    viewAllLink: {
        color: '#7c3aed',
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: '0.9rem',
    } as React.CSSProperties,
    sectionTitle: {
        fontSize: '0.9rem',
        fontWeight: 600,
        marginBottom: '1rem',
        marginTop: '2rem',
        color: '#1e1b4b',
    } as React.CSSProperties,
};

export default function DashboardPage() {
    return (
        <>
            {/* Page Header */}
            <div style={styles.pageHeader}>
                <h1 style={styles.pageTitle}>Welcome back! 👋</h1>
                <p style={styles.pageSubtitle}>Here&apos;s what&apos;s happening with your trading journey today.</p>
            </div>

            {/* Stats Grid */}
            <div style={styles.statsGrid}>
                {statsData.map((stat, index) => (
                    <div style={styles.statCard} key={index}>
                        <div style={styles.statHeader}>
                            <div>
                                <h3 style={styles.statTitle}>{stat.title}</h3>
                                <div style={{ ...styles.statValue, color: stat.valueColor || '#1e1b4b' }}>
                                    {stat.value}
                                </div>
                            </div>
                            <div style={styles.statIcon(stat.iconBg)}>{stat.icon}</div>
                        </div>
                        <div style={styles.statFooter}>
                            {stat.change && (
                                <span style={styles.statChange(stat.positive || false)}>
                                    ↑ {stat.change}
                                </span>
                            )}
                            <span style={{ color: '#64748b' }}>{stat.period}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Dashboard Grid */}
            <div style={styles.dashboardGrid}>
                {/* Portfolio Performance */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>Portfolio Performance</h3>
                        <div style={styles.cardActions}>
                            <button style={styles.btnSm(true)}>1W</button>
                            <button style={styles.btnSm(false)}>1M</button>
                            <button style={styles.btnSm(false)}>3M</button>
                            <button style={styles.btnSm(false)}>1Y</button>
                        </div>
                    </div>
                    <div style={styles.chartContainer}>
                        <div style={styles.chartPlaceholder}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                            <div>Chart visualization will appear here</div>
                            <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                                Showing your trading performance over time
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>Quick Actions</h3>
                    </div>
                    <div style={styles.quickActions}>
                        {quickActions.map((action, index) => (
                            <Link href={action.href} key={index} style={styles.actionBtn}>
                                <div style={styles.actionIcon}>{action.icon}</div>
                                <div style={styles.actionText}>{action.text}</div>
                            </Link>
                        ))}
                    </div>

                    <h4 style={styles.sectionTitle}>Recent Achievements</h4>
                    <div style={styles.achievementList}>
                        {recentAchievements.map((achievement, index) => (
                            <div style={styles.achievementItem} key={index}>
                                <div style={styles.achievementIcon}>{achievement.icon}</div>
                                <div style={styles.achievementInfo}>
                                    <div style={styles.achievementTitle}>{achievement.title}</div>
                                    <div style={styles.achievementDesc}>{achievement.description}</div>
                                </div>
                                <div style={styles.achievementXp}>{achievement.xp}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Section - Recent Trades */}
            <div style={styles.dashboardGrid}>
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>Recent Trades</h3>
                        <Link href="/dashboard/history" style={styles.viewAllLink}>
                            View All →
                        </Link>
                    </div>
                    <div style={styles.tradeList}>
                        {recentTrades.map((trade, index) => (
                            <div style={styles.tradeItem} key={index}>
                                <div style={styles.tradeIcon(trade.type)}>{trade.type.toUpperCase()}</div>
                                <div style={styles.tradeInfo}>
                                    <div style={styles.tradeSymbol}>{trade.symbol}</div>
                                    <div style={styles.tradeTime}>{trade.time}</div>
                                </div>
                                <div style={styles.tradeAmount}>
                                    <div style={styles.tradePnl(trade.positive)}>{trade.pnl}</div>
                                    <div style={styles.tradeSize}>{trade.size}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Continue Learning */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>Continue Learning</h3>
                        <Link href="/dashboard/courses" style={styles.viewAllLink}>
                            View All →
                        </Link>
                    </div>
                    <div style={styles.achievementList}>
                        <div style={styles.achievementItem}>
                            <div style={styles.achievementIcon}>📚</div>
                            <div style={styles.achievementInfo}>
                                <div style={styles.achievementTitle}>Technical Analysis Basics</div>
                                <div style={styles.achievementDesc}>65% complete • 3 lessons left</div>
                            </div>
                        </div>
                        <div style={styles.achievementItem}>
                            <div style={styles.achievementIcon}>📈</div>
                            <div style={styles.achievementInfo}>
                                <div style={styles.achievementTitle}>Risk Management 101</div>
                                <div style={styles.achievementDesc}>40% complete • 6 lessons left</div>
                            </div>
                        </div>
                        <div style={styles.achievementItem}>
                            <div style={styles.achievementIcon}>🎯</div>
                            <div style={styles.achievementInfo}>
                                <div style={styles.achievementTitle}>Trading Psychology</div>
                                <div style={styles.achievementDesc}>20% complete • 8 lessons left</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
