import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiMenu, FiX, FiChevronDown, FiUser, FiLogOut, FiGrid } from 'react-icons/fi'

const tools = [
  { to: '/tools/merge', label: 'Merge PDF', icon: '🔗' },
  { to: '/tools/split', label: 'Split PDF', icon: '✂️' },
  { to: '/tools/compress', label: 'Compress PDF', icon: '📦' },
  { to: '/tools/rotate', label: 'Rotate PDF', icon: '🔄' },
  { to: '/tools/watermark', label: 'Watermark PDF', icon: '💧' },
  { to: '/tools/protect', label: 'Protect PDF', icon: '🔒' },
  { to: '/tools/reorder', label: 'Reorder Pages', icon: '📋' },
  { to: '/tools/info', label: 'PDF Info', icon: '📊' },
  { to: '/tools/jpg-to-pdf', label: 'JPG to PDF', icon: '🖼️' },
  { to: '/tools/extract-text', label: 'Extract Text', icon: '📝' },
  { to: '/tools/word-to-pdf', label: 'Word to PDF', icon: '📄' },
  { to: '/tools/fillable-pdf', label: 'Bank Form Filler', icon: '🏦' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const { user, logout, isAuth } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <span className="navbar-logo-icon">📄</span>
            PDFtoolkit
          </Link>

          {/* Desktop Nav */}
          <div className="navbar-nav">
            <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              Home
            </NavLink>

            {/* Tools dropdown */}
            <div style={{ position: 'relative' }}
              onMouseEnter={() => setToolsOpen(true)}
              onMouseLeave={() => setToolsOpen(false)}>
              <button className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                Tools <FiChevronDown size={14} style={{ transition: '0.2s', transform: toolsOpen ? 'rotate(180deg)' : 'none' }} />
              </button>
              {toolsOpen && (
                <div style={{
                  position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)',
                  padding: '8px', minWidth: '220px', zIndex: 200, boxShadow: 'var(--shadow-lg)',
                  display: 'grid', gap: '2px'
                }}>
                  {tools.map(t => (
                    <Link key={t.to} to={t.to} onClick={() => setToolsOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: 14, transition: 'all 0.2s', textDecoration: 'none' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-glass-hover)'; e.currentTarget.style.color = 'white' }}
                      onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-secondary)' }}>
                      <span>{t.icon}</span>{t.label}
                    </Link>
                  ))}
                  <div style={{ margin: '4px 0', height: 1, background: 'var(--border-light)' }} />
                  <Link to="/tools" onClick={() => setToolsOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-md)', color: 'var(--accent-purple-light)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                    <FiGrid size={14} /> All Tools
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="navbar-actions">
            {isAuth ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link to={user?.role === 'admin' ? "/dashboard" : "/profile"} className="btn btn-ghost btn-sm">
                  <FiUser size={14} /> {user?.name?.split(' ')[0]}
                </Link>
                <button onClick={handleLogout} className="btn btn-outline btn-sm">
                  <FiLogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Log In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Sign Up Free</Link>
              </>
            )}
            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <Link to="/" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>🏠 Home</Link>
        {tools.map(t => (
          <Link key={t.to} to={t.to} className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
            {t.icon} {t.label}
          </Link>
        ))}
        <Link to="/tools" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>🔧 All Tools</Link>
        <div style={{ height: 1, background: 'var(--border-light)', margin: '8px 0' }} />
        {isAuth ? (
          <>
            <Link to={user?.role === 'admin' ? "/dashboard" : "/profile"} className="mobile-nav-link" onClick={() => setMenuOpen(false)}>👤 {user?.role === 'admin' ? 'Dashboard' : 'Profile'}</Link>
            <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="btn btn-outline" style={{ marginTop: 8 }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>🔑 Log In</Link>
            <Link to="/register" className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => setMenuOpen(false)}>Sign Up Free</Link>
          </>
        )}
      </div>
    </>
  )
}
