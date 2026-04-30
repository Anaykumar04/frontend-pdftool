import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showGoogleModal, setShowGoogleModal] = useState(false)
  const [googleAccounts] = useState([
    { id: 1, name: 'Anay Kumar', email: 'anay_kumar@gmail.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anay' },
    { id: 2, name: 'Work Profile', email: 'anay.work@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Work' }
  ])
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Please fill all fields')
    setLoading(true)
    try {
      const u = await login(form.email, form.password)
      toast.success('Welcome back! 🎉')
      if (u?.role === 'admin') {
        navigate('/dashboard')
      } else {
        navigate('/profile')
      }
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally { setLoading(false) }
  }

  const handleGoogleAuthStart = () => {
    setShowGoogleModal(true)
  }

  const handleGoogleAccountSelect = async (account) => {
    setShowGoogleModal(false)
    setLoading(true)
    try {
      const password = 'google_demo_password_123'
      let authenticatedUser;
      try {
        authenticatedUser = await login(account.email, password)
      } catch (err) {
        if (register) {
          authenticatedUser = await register(account.name, account.email, password)
        }
      }
      toast.success(`Successfully authenticated as ${account.name}! 🎉`)
      if (authenticatedUser?.role === 'admin') {
        navigate('/dashboard')
      } else {
        navigate('/profile')
      }
    } catch (err) {
      toast.error('Google authentication failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'var(--accent-purple)', filter: 'blur(120px)', opacity: 0.08, top: '-100px', right: '-100px' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'var(--accent-blue)', filter: 'blur(100px)', opacity: 0.06, bottom: '0', left: '0' }} />
      </div>

      <div className="auth-card animate-fade-up">
        <div className="auth-logo">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ width: 36, height: 36, background: 'var(--gradient-btn)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📄</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700 }}>PDFtoolkit</span>
          </div>
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to access your PDF history and more</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} autoFocus />
          </div>
          <div>
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
            {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in...</> : '🔑 Sign In'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <button type="button" className="btn btn-outline" onClick={handleGoogleAuthStart} style={{ width: '100%', justifyContent: 'center', gap: 12, marginBottom: 12, background: 'white', borderColor: '#e2e8f0', color: '#475569', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" alt="Google" style={{ width: 18 }} />
          Continue with Google
        </button>

        <Link to="/tools" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
          Continue without account →
        </Link>

        <p className="auth-footer">
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent-purple-light)', fontWeight: 600 }}>Sign up free</Link>
        </p>
      </div>

      {/* Google Account Chooser Modal */}
      {showGoogleModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 12, width: 400, maxWidth: '90%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', animation: 'fadeUp 0.3s ease-out' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" alt="Google Logo" style={{ width: 40, marginBottom: 12 }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#202124' }}>Sign in with Google</h2>
              <p style={{ color: '#5f6368', fontSize: '0.9rem', marginTop: 8 }}>Choose an account to continue to PDFtoolkit</p>
            </div>
            
            <div style={{ borderTop: '1px solid #dadce0', borderBottom: '1px solid #dadce0', margin: '0 -24px', padding: '12px 0' }}>
              {googleAccounts.map(acc => (
                <div key={acc.id} onClick={() => handleGoogleAccountSelect(acc)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 24px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <img src={acc.avatar} alt={acc.name} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #e2e8f0' }} />
                  <div>
                    <div style={{ fontWeight: 500, color: '#3c4043', fontSize: '0.95rem' }}>{acc.name}</div>
                    <div style={{ color: '#5f6368', fontSize: '0.85rem' }}>{acc.email}</div>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 24px', cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => setShowGoogleModal(false)} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f3f4', color: '#5f6368' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
                </div>
                <div style={{ fontWeight: 500, color: '#3c4043', fontSize: '0.95rem' }}>Use another account</div>
              </div>
            </div>

            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <button onClick={() => setShowGoogleModal(false)} style={{ background: 'transparent', border: 'none', color: '#1a73e8', fontWeight: 500, cursor: 'pointer', padding: '8px 16px', borderRadius: 4 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
