import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { GoogleLogin } from '@react-oauth/google'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState('')
  const [otp, setOtp] = useState('')
  const { register, sendOTP, verifyOTP, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all fields')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      const u = await register(form.name, form.email, form.password)
      // Admin → direct access, no OTP needed
      if (u.role === 'admin' || u.isVerified) {
        toast.success(`Welcome, ${u.name}! 🎉`)
        navigate(u.role === 'admin' ? '/dashboard' : '/profile')
      } else {
        // Regular user → show OTP modal (OTP already sent by backend)
        setSelectedEmail(form.email)
        setShowOtpModal(true)
        toast.success('Account created! Check your email for the verification code')
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  const handleOtpVerify = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) return toast.error('Enter 6-digit OTP')
    setLoading(true)
    try {
      const u = await verifyOTP(selectedEmail, otp)
      toast.success(`Welcome to PDFtoolkit, ${u.name}! 🎉`)
      setShowOtpModal(false)
      navigate('/profile')
    } catch (err) {
      toast.error('Invalid or expired OTP')
    } finally { setLoading(false) }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true)
    try {
      const u = await loginWithGoogle(credentialResponse.credential)
      toast.success(`Welcome to PDFtoolkit, ${u.name}! 🎉`)
      navigate(u.role === 'admin' ? '/dashboard' : '/profile')
    } catch (err) {
      toast.error(err.message || 'Google login failed')
    } finally { setLoading(false) }
  }

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <div className="auth-page">
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'var(--accent-purple)', filter: 'blur(120px)', opacity: 0.08, top: '-100px', left: '-100px' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'var(--accent-cyan)', filter: 'blur(100px)', opacity: 0.06, bottom: 0, right: 0 }} />
      </div>

      <div className="auth-card animate-fade-up">
        <div className="auth-logo">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ width: 36, height: 36, background: 'var(--gradient-btn)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📄</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700 }}>PDFtoolkit</span>
          </div>
        </div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Free forever. No credit card required.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <label>Full Name</label>
            <input type="text" placeholder="John Doe" value={form.name} onChange={update('name')} autoFocus />
          </div>
          <div>
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} />
          </div>
          <div>
            <label>Password</label>
            <input type="password" placeholder="Min. 6 characters" value={form.password} onChange={update('password')} />
          </div>
          <div>
            <label>Confirm Password</label>
            <input type="password" placeholder="Repeat password" value={form.confirm} onChange={update('confirm')} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
            {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating account...</> : '🚀 Create Free Account'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error('Google login failed')}
            useOneTap
            theme="filled_blue"
            shape="pill"
            text="signup_with"
          />
        </div>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-purple-light)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1a1a2e', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 16, width: 420, maxWidth: '90%', padding: '32px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📧</div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Verify your email</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: 8 }}>
                We sent a 6-digit code to<br />
                <strong style={{ color: '#c4b5fd' }}>{selectedEmail}</strong>
              </p>
            </div>

            <form onSubmit={handleOtpVerify}>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                style={{ width: '100%', padding: '14px', borderRadius: 10, border: '1px solid rgba(139,92,246,0.4)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px', boxSizing: 'border-box', outline: 'none' }}
                autoFocus
              />
              <button type="submit" className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} disabled={loading}>
                {loading ? 'Verifying...' : '✅ Verify Email'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.85rem', color: '#64748b' }}>
              Didn't receive it?{' '}
              <button type="button" onClick={() => { sendOTP(selectedEmail); toast.success('New code sent!') }}
                style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
                Resend code
              </button>
            </p>

            <button onClick={() => setShowOtpModal(false)}
              style={{ display: 'block', margin: '12px auto 0', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

