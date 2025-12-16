'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import '@/app/dashboard/dashboard.css'

const sidebarItems = [
  { icon: '📊', label: 'Dashboard', href: '/dashboard' },
  { icon: '💼', label: 'Portfolio', href: '/dashboard/portfolio' },
  { icon: '📈', label: 'Trading', href: '/dashboard/trading' },
  { icon: '📜', label: 'Trade History', href: '/dashboard/history' },
]

const learningSidebar = [
  { icon: '🎓', label: 'Courses', href: '/dashboard/courses' },
  { icon: '📚', label: 'Lessons', href: '/dashboard/lessons', badge: '3' },
  { icon: '🏆', label: 'Achievements', href: '/dashboard/achievements' },
  { icon: '👥', label: 'Leaderboard', href: '/dashboard/leaderboard' },
]

const accountSidebar = [
  { icon: '⚙️', label: 'Settings', href: '/dashboard/settings' },
  { icon: '❓', label: 'Help & Support', href: '/dashboard/support' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById('sidebar')
      const menuBtn = document.querySelector('.mobile-menu-btn')

      if (window.innerWidth <= 1024 &&
        isMobileMenuOpen &&
        sidebar &&
        !sidebar.contains(e.target as Node) &&
        menuBtn &&
        !menuBtn.contains(e.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMobileMenuOpen])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="dashboard-container">

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`} id="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span>🚀</span> DynoFX
          </div>
        </div>

        <nav className="nav-menu">
          <div className="nav-section">
            <div className="nav-section-title">Main</div>
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Learning</div>
            {learningSidebar.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && <span className="badge">{item.badge}</span>}
              </Link>
            ))}
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Account</div>
            {accountSidebar.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {user?.email ? user.email[0].toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.user_metadata?.full_name || 'Trader'}</div>
              <div className="user-role">Level 1 Trader</div>
            </div>
            <button
              onClick={handleSignOut}
              className="logout-btn"
              title="Sign Out"
            >
              ⋮
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <div className="topbar">
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            ☰
          </button>

          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search trades, courses, or symbols..." />
          </div>

          <div className="topbar-actions">
            <button className="icon-btn">
              🔔
              <span className="badge-dot"></span>
            </button>
            <button className="icon-btn">💬</button>
            <button className="btn-primary">+ New Trade</button>
          </div>
        </div>

        {/* Page Content */}
        {children}
      </main>
    </div>
  )
}
