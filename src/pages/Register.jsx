import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FcGoogle } from 'react-icons/fc'
import { GoogleLogin } from '@react-oauth/google'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [showGoogleModal, setShowGoogleModal] = useState(false)
  const [googleStep, setGoogleStep] = useState('list') // 'list', 'email', 'otp'
  const [selectedEmail, setSelectedEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [customEmail, setCustomEmail] = useState('')
  const { register, login, sendOTP, verifyOTP, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all fields')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      await sendOTP(form.email)
      setSelectedEmail(form.email)
      setGoogleStep('otp')
      setShowGoogleModal(true)
      toast.success('Account created! Please verify your email 🎉')
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  const startVerification = async (email, name) => {
    setLoading(true)
    try {
      const password = 'google_demo_password_123'
      try {
        await login(email, password)
      } catch (err) {
        await register(name, email, password)
      }
      await sendOTP(email)
      setGoogleStep('otp')
      toast.success('Verification code sent to ' + email)
    } catch (err) {
      toast.error('Failed to start verification')
    } finally { setLoading(false) }
  }

  const handleOtpVerify = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) return toast.error('Enter 6-digit OTP')
    setLoading(true)
    try {
      const u = await verifyOTP(selectedEmail, otp)
      toast.success(`Welcome, ${u.name}! 🎉`)
      setShowGoogleModal(false)
      navigate(u.role === 'admin' ? '/dashboard' : '/profile')
    } catch (err) {
      toast.error('Invalid OTP')
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
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
            {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Processing...</> : '🚀 Create Free Account'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <GoogleLogin
            onSuccess={async (res) => {
              try {
                setLoading(true)
                const u = await loginWithGoogle(res.credential)
                toast.success(`Welcome, ${u.name}! 🎉`)
                navigate(u.role === 'admin' ? '/dashboard' : '/profile')
              } catch (err) {
                toast.error('Google registration failed')
              } finally { setLoading(false) }
            }}
            onError={() => toast.error('Google registration failed')}
            theme="filled_black"
            shape="pill"
            width="100%"
          />
        </div>

        <p className="auth-footer">
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-purple-light)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>

      {/* OTP Verification Modal (for manual registration) */}
      {showGoogleModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 12, width: 400, maxWidth: '90%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', animation: 'fadeUp 0.3s ease-out' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#202124' }}>
                Verify your identity
              </h2>
              <p style={{ color: '#5f6368', fontSize: '0.9rem', marginTop: 8 }}>
                Enter the code sent to {selectedEmail}
              </p>
            </div>
            
            <form onSubmit={handleOtpVerify} style={{ padding: '0 4px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
                <input 
                  type="text" 
                  placeholder="      6-digit code" 
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #dadce0', textAlign: 'center', fontSize: '1.2rem', letterSpacing: '4px' }}
                  autoFocus
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', background: '#1a73e8' }} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>
              <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.85rem', color: '#5f6368' }}>
                Didn't get a code? <button type="button" onClick={() => sendOTP(selectedEmail)} style={{ background: 'none', border: 'none', color: '#1a73e8', cursor: 'pointer', padding: 0 }}>Resend</button>
              </p>
            </form>

            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <button onClick={() => setShowGoogleModal(false)} style={{ background: 'transparent', border: 'none', color: '#1a73e8', fontWeight: 500, cursor: 'pointer', padding: '8px 16px', borderRadius: 4 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
