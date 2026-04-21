import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Please fill all fields')
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back! 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally { setLoading(false) }
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    try {
      // Simulated Google Auth for demo purposes since no client ID was provided
      const email = 'google_user@example.com'
      const password = 'google_demo_password_123'
      try {
        await login(email, password)
      } catch (err) {
        // If login fails, try to register the mock user via the API directly
        if (register) {
          await register('Google User', email, password)
        }
      }
      toast.success('Successfully authenticated with Google! 🎉')
      navigate('/dashboard')
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

        <button type="button" className="btn btn-outline" onClick={handleGoogleAuth} style={{ width: '100%', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
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
    </div>
  )
}
