import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FcGoogle } from 'react-icons/fc'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [showGoogleModal, setShowGoogleModal] = useState(false)
  const [googleStep, setGoogleStep] = useState('list') // 'list', 'email', 'otp'
  const [selectedEmail, setSelectedEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [customEmail, setCustomEmail] = useState('')
  const [googleAccounts] = useState([
    { id: 1, name: 'Anay Kumar', email: 'anay_kumar@gmail.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anay' },
    { id: 2, name: 'Work Profile', email: 'anay.work@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Work' }
  ])
  const { register, login, sendOTP, verifyOTP } = useAuth()
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

  const handleGoogleAuthStart = () => {
    setGoogleStep('list')
    setShowGoogleModal(true)
  }

  const handleGoogleAccountSelect = async (account) => {
    setSelectedEmail(account.email)
    await startVerification(account.email, account.name)
  }

  const handleCustomEmailSubmit = async (e) => {
    e.preventDefault()
    if (!customEmail) return toast.error('Please enter an email')
    setSelectedEmail(customEmail)
    await startVerification(customEmail, customEmail.split('@')[0])
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
        <button type="button" className="btn btn-outline" onClick={handleGoogleAuthStart} style={{ width: '100%', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
          <FcGoogle size={20} />
          Continue with Google
        </button>

        <p className="auth-footer">
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-purple-light)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>

      {/* Google Auth / OTP Modal */}
      {showGoogleModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 12, width: 400, maxWidth: '90%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', animation: 'fadeUp 0.3s ease-out' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <FcGoogle size={40} style={{ marginBottom: 12 }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#202124' }}>
                {googleStep === 'otp' ? 'Verify your identity' : 'Sign in with Google'}
              </h2>
              <p style={{ color: '#5f6368', fontSize: '0.9rem', marginTop: 8 }}>
                {googleStep === 'otp' ? `Enter the code sent to ${selectedEmail}` : 'Continue to PDFtoolkit'}
              </p>
            </div>
            
            {googleStep === 'list' && (
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 24px', cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => setGoogleStep('email')} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f3f4', color: '#5f6368' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
                  </div>
                  <div style={{ fontWeight: 500, color: '#3c4043', fontSize: '0.95rem' }}>Use another account</div>
                </div>
              </div>
            )}

            {googleStep === 'email' && (
              <form onSubmit={handleCustomEmailSubmit} style={{ padding: '0 4px' }}>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={customEmail}
                  onChange={e => setCustomEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #dadce0', marginBottom: 16, fontSize: '1rem' }}
                  autoFocus
                />
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', background: '#1a73e8' }} disabled={loading}>
                  {loading ? 'Processing...' : 'Next'}
                </button>
              </form>
            )}

            {googleStep === 'otp' && (
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
            )}

            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <button onClick={() => setShowGoogleModal(false)} style={{ background: 'transparent', border: 'none', color: '#1a73e8', fontWeight: 500, cursor: 'pointer', padding: '8px 16px', borderRadius: 4 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
