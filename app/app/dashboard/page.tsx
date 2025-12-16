'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import './dashboard.css';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
        setLoading(false);
      }
    };
    checkUser();
  }, [router, supabase]);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      const statValues = document.querySelectorAll('.stat-value');
      if (statValues.length > 0) {
        const randomStat = statValues[Math.floor(Math.random() * statValues.length)] as HTMLElement;
        randomStat.style.transform = 'scale(1.05)';
        setTimeout(() => {
          randomStat.style.transform = 'scale(1)';
        }, 300);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--gray-light)',
        color: 'var(--primary)',
        fontSize: '1.2rem',
        fontWeight: 600
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Content */}
      <div className="content">
        {/* Page Header */}
        <div className="page-header">
          <h1>Welcome back, {user?.user_metadata?.full_name || 'Trader'}! 👋</h1>
          <p>Here's what's happening with your trading journey today.</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-info">
                <h3>Virtual Balance</h3>
                <div className="stat-value">$102,456</div>
              </div>
              <div className="stat-icon purple">💰</div>
            </div>
            <div className="stat-footer">
              <span className="stat-change positive">↑ +2.45%</span>
              <span style={{ color: 'var(--gray)' }}>vs last month</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-info">
                <h3>Total P&L</h3>
                <div className="stat-value" style={{ color: 'var(--success)' }}>+$2,456</div>
              </div>
              <div className="stat-icon green">📈</div>
            </div>
            <div className="stat-footer">
              <span className="stat-change positive">↑ +12.3%</span>
              <span style={{ color: 'var(--gray)' }}>this week</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-info">
                <h3>Win Rate</h3>
                <div className="stat-value">67.5%</div>
              </div>
              <div className="stat-icon cyan">🎯</div>
            </div>
            <div className="stat-footer">
              <span className="stat-change positive">↑ +5.2%</span>
              <span style={{ color: 'var(--gray)' }}>improving</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-info">
                <h3>Courses Completed</h3>
                <div className="stat-value">23/50</div>
              </div>
              <div className="stat-icon orange">🎓</div>
            </div>
            <div className="stat-footer">
              <span style={{ color: 'var(--gray)' }}>3 in progress</span>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Portfolio Performance */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Portfolio Performance</h3>
              <div className="card-actions">
                <button className="btn-sm active">1W</button>
                <button className="btn-sm">1M</button>
                <button className="btn-sm">3M</button>
                <button className="btn-sm">1Y</button>
              </div>
            </div>
            <div className="chart-container">
              <div className="chart-placeholder">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                <div>Chart visualization will appear here</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--gray)', marginTop: '0.5rem' }}>
                  Showing your trading performance over time
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Quick Actions</h3>
            </div>
            <div className="quick-actions">
              <button className="action-btn">
                <div className="action-btn-icon">📈</div>
                <div className="action-btn-text">Start Trading</div>
              </button>
              <button className="action-btn">
                <div className="action-btn-icon">🎓</div>
                <div className="action-btn-text">Learn More</div>
              </button>
              <button className="action-btn">
                <div className="action-btn-icon">🏆</div>
                <div className="action-btn-text">Competitions</div>
              </button>
              <button className="action-btn">
                <div className="action-btn-icon">📊</div>
                <div className="action-btn-text">Analytics</div>
              </button>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--secondary)' }}>
                Recent Achievements
              </h4>
              <div className="achievement-list">
                <div className="achievement-item">
                  <div className="achievement-icon">🏆</div>
                  <div className="achievement-info">
                    <div className="achievement-title">First Win!</div>
                    <div className="achievement-desc">Completed your first profitable trade</div>
                  </div>
                  <div className="achievement-xp">+50 XP</div>
                </div>
                <div className="achievement-item">
                  <div className="achievement-icon">🎯</div>
                  <div className="achievement-info">
                    <div className="achievement-title">10 Trades</div>
                    <div className="achievement-desc">Executed 10 simulation trades</div>
                  </div>
                  <div className="achievement-xp">+100 XP</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="dashboard-grid">
          {/* Recent Trades */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Trades</h3>
              <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                View All →
              </a>
            </div>
            <div className="trade-list">
              <div className="trade-item">
                <div className="trade-icon buy">BUY</div>
                <div className="trade-info">
                  <div className="trade-symbol">EUR/USD</div>
                  <div className="trade-time">2 hours ago</div>
                </div>
                <div className="trade-amount">
                  <div className="trade-pnl positive">+$245.50</div>
                  <div className="trade-size">0.5 lots</div>
                </div>
              </div>

              <div className="trade-item">
                <div className="trade-icon sell">SELL</div>
                <div className="trade-info">
                  <div className="trade-symbol">GBP/USD</div>
                  <div className="trade-time">5 hours ago</div>
                </div>
                <div className="trade-amount">
                  <div className="trade-pnl negative">-$87.20</div>
                  <div className="trade-size">0.3 lots</div>
                </div>
              </div>

              <div className="trade-item">
                <div className="trade-icon buy">BUY</div>
                <div className="trade-info">
                  <div className="trade-symbol">USD/JPY</div>
                  <div className="trade-time">1 day ago</div>
                </div>
                <div className="trade-amount">
                  <div className="trade-pnl positive">+$156.80</div>
                  <div className="trade-size">0.4 lots</div>
                </div>
              </div>

              <div className="trade-item">
                <div className="trade-icon buy">BUY</div>
                <div className="trade-info">
                  <div className="trade-symbol">BTC/USD</div>
                  <div className="trade-time">2 days ago</div>
                </div>
                <div className="trade-amount">
                  <div className="trade-pnl positive">+$412.30</div>
                  <div className="trade-size">0.02 BTC</div>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Progress */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Continue Learning</h3>
              <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                Browse All →
              </a>
            </div>

            <div className="course-grid">
              <div className="course-card">
                <div className="course-thumbnail">📈</div>
                <div className="course-title">Technical Analysis Basics</div>
                <div className="course-progress">65% complete</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '65%' }}></div>
                </div>
              </div>

              <div className="course-card">
                <div className="course-thumbnail">💡</div>
                <div className="course-title">Risk Management 101</div>
                <div className="course-progress">30% complete</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '30%' }}></div>
                </div>
              </div>

              <div className="course-card">
                <div className="course-thumbnail">🎯</div>
                <div className="course-title">Price Action Trading</div>
                <div className="course-progress">Not started</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '0%' }}></div>
                </div>
              </div>

              <div className="course-card">
                <div className="course-thumbnail">📊</div>
                <div className="course-title">Market Psychology</div>
                <div className="course-progress">90% complete</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '90%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="dashboard-grid">
          {/* Market Updates */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Market Updates</h3>
              <button className="btn-sm">Refresh</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'var(--gray-light)', borderRadius: '12px', borderLeft: '3px solid var(--success)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <strong style={{ color: 'var(--secondary)' }}>EUR/USD</strong>
                  <span style={{ color: 'var(--success)', fontWeight: 700 }}>↑ 1.0856</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>+0.32% today</div>
              </div>

              <div style={{ padding: '1rem', background: 'var(--gray-light)', borderRadius: '12px', borderLeft: '3px solid var(--error)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <strong style={{ color: 'var(--secondary)' }}>GBP/USD</strong>
                  <span style={{ color: 'var(--error)', fontWeight: 700 }}>↓ 1.2634</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>-0.18% today</div>
              </div>

              <div style={{ padding: '1rem', background: 'var(--gray-light)', borderRadius: '12px', borderLeft: '3px solid var(--success)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <strong style={{ color: 'var(--secondary)' }}>BTC/USD</strong>
                  <span style={{ color: 'var(--success)', fontWeight: 700 }}>↑ 43,256</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>+2.45% today</div>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Upcoming Events</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'var(--gray-light)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ textAlign: 'center', minWidth: '50px' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>15</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>DEC</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.25rem' }}>Live Trading Webinar</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>Join expert traders for live market analysis</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.5rem' }}>🕐 2:00 PM EST</div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '1rem', background: 'var(--gray-light)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ textAlign: 'center', minWidth: '50px' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>20</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>DEC</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.25rem' }}>Trading Competition Finals</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>Compete for prizes and recognition</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--warning)', marginTop: '0.5rem' }}>🏆 $5,000 Prize Pool</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Warning */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05), rgba(6, 182, 212, 0.05))',
          borderRadius: '16px',
          padding: '2rem',
          marginTop: '2rem',
          border: '2px solid rgba(124, 58, 237, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ fontSize: '2rem' }}>⚠️</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                Practice Mode Active
              </h3>
              <p style={{ color: 'var(--gray)', lineHeight: 1.6 }}>
                You're currently trading with <strong>virtual money</strong> for educational purposes. All trades are simulations and do not involve real financial transactions. Use this platform to learn and practice before considering real trading.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
