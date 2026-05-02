import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FcGoogle } from 'react-icons/fc'
import { GoogleLogin } from '@react-oauth/google'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showGoogleModal, setShowGoogleModal] = useState(false)
  const [googleStep, setGoogleStep] = useState('list') // 'list', 'email', 'otp'
  const [selectedEmail, setSelectedEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [customEmail, setCustomEmail] = useState('')
  const { login, register, sendOTP, verifyOTP, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Please fill all fields')
    setLoading(true)
    try {
      const u = await login(form.email, form.password)
      if (!u.isVerified) {
        setSelectedEmail(form.email)
        await sendOTP(form.email)
        setGoogleStep('otp')
        setShowGoogleModal(true)
        toast.success('Please verify your email')
      } else {
        toast.success('Welcome back! 🎉')
        navigate(u.role === 'admin' ? '/dashboard' : '/profile')
      }
    } catch (err) {
      toast.error(err.message || 'Login failed')
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
            {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Processing...</> : '🔑 Sign In'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              setLoading(true);
              try {
                const u = await loginWithGoogle(credentialResponse.credential);
                toast.success(`Welcome back, ${u.name}! 🎉`);
                navigate(u.role === 'admin' ? '/dashboard' : '/profile');
              } catch (err) {
                toast.error(err.message || 'Google Login failed');
              } finally {
                setLoading(false);
              }
            }}
            onError={() => {
              toast.error('Google Login Failed');
            }}
            useOneTap
            theme="filled_blue"
            shape="pill"
          />
        </div>

        <p className="auth-footer">
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent-purple-light)', fontWeight: 600 }}>Sign up free</Link>
        </p>
      </div>

      {/* OTP Verification Modal (for manual login) */}
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
