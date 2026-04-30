import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, API } from '../context/AuthContext'
import { historyApi } from '../services/api'
import { formatDate, formatBytes } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: user?.address || '',
    avatar: user?.avatar || ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        address: user.address || '',
        avatar: user.avatar || ''
      })

      historyApi.get()
        .then(res => setHistory(res.data.history || []))
        .catch(err => console.error(err))
        .finally(() => setLoading(false))
    }
  }, [user])

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await updateProfile(formData)
      toast.success('Profile updated successfully! ✨')
      setEditing(false)
    } catch (err) {
      toast.error('Failed to update profile')
    }
  }

  if (!user) return null

  return (
    <div className="profile-page" style={{ padding: '40px 20px', maxWidth: 1200, margin: '0 auto', color: 'var(--text-primary)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 40 }}>

        {/* Profile Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: 'var(--bg-primary)', borderRadius: 24, padding: 32, boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)' }}>
            <div
              style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 24px', borderRadius: '50%', overflow: 'hidden', border: '4px solid #f8fafc', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', cursor: 'pointer', background: '#f1f5f9' }}
              onClick={() => document.getElementById('avatarInput').click()}
              title="Click to change photo"
            >
              {user.avatar ? (
                <img
                  src={user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}${user.avatar.startsWith('/') ? '' : '/'}${user.avatar}`}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div style={{
                width: '100%', height: '100%',
                background: 'var(--gradient-hero)',
                color: 'white',
                display: user.avatar ? 'none' : 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '3rem', fontWeight: 700
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '0.65rem', padding: '4px 0', textAlign: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0}>
                Change
              </div>
            </div>
            <input
              id="avatarInput"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const formData = new FormData();
                formData.append('file', file);
                const t = toast.loading('Uploading photo...');
                try {
                  const res = await API.post('/upload/file', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                  await updateProfile({ avatar: res.data.secure_url });
                  toast.success('Photo updated!', { id: t });
                } catch (err) {
                  console.error('Upload error:', err);
                  const msg = err.response?.data?.error || 'Failed to upload photo. Please check Cloudinary config.';
                  toast.error(msg, { id: t });
                }
              }}
            />

            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>{user.name}</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{user.email}</p>
              <div style={{ marginTop: 12, display: 'inline-flex', padding: '4px 12px', background: 'var(--bg-card)', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>
                {user.plan} Account
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Subscription</span>
                <span style={{ fontWeight: 600, color: user.plan === 'free' ? '#64748b' : '#10b981' }}>
                  {user.plan === 'free' ? 'Free Forever' : 'Pro Plan'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Expires On</span>
                <span style={{ fontWeight: 600 }}>{user.subscriptionEnd ? formatDate(user.subscriptionEnd).split(',')[0] : 'Never'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Joined</span>
                <span style={{ fontWeight: 600 }}>{formatDate(user.createdAt).split(',')[0]}</span>
              </div>
            </div>

            <button
              onClick={() => setEditing(!editing)}
              style={{ width: '100%', marginTop: 32, padding: '12px', borderRadius: 12, border: 'none', background: editing ? 'var(--bg-card)' : 'var(--navbar-bg)', color: editing ? 'var(--text-secondary)' : 'white', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              {editing ? 'Cancel Editing' : 'Edit Profile'}
            </button>
          </div>

          <div style={{ background: 'var(--gradient-hero)', borderRadius: 24, padding: 32, color: 'white' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 12 }}>Need more power?</h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: 24 }}>Upgrade to Pro to unlock unlimited file size, more tools, and priority processing.</p>
            <Link to="/pricing" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: 'white', color: 'var(--navbar-bg)', fontWeight: 700, cursor: 'pointer' }}>Upgrade Now 🚀</button>
            </Link>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {editing ? (
            <div style={{ background: 'var(--bg-primary)', borderRadius: 24, padding: 40, boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 24 }}>Update Account Information</h3>
              <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: '#64748b' }}>Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none', color: '#1e293b', fontWeight: 500 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: '#64748b' }}>Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none', color: '#1e293b', fontWeight: 500 }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: '#64748b' }}>Avatar URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com/photo.jpg"
                    value={formData.avatar}
                    onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none', color: '#1e293b', fontWeight: 500 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: '#64748b' }}>Full Address</label>
                  <textarea
                    rows="3"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none', resize: 'none', color: '#1e293b', fontWeight: 500 }}
                  />
                </div>
                <button type="submit" style={{ padding: '14px', borderRadius: 12, border: 'none', background: 'var(--accent-cyan)', color: 'white', fontWeight: 700, cursor: 'pointer', marginTop: 10 }}>
                  Save Changes
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Stats Overview */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                <div style={{ background: 'var(--bg-primary)', borderRadius: 20, padding: 24, border: '1px solid var(--border-light)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>📄</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{history.length}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Files Processed</div>
                </div>
                <div style={{ background: 'var(--bg-primary)', borderRadius: 20, padding: 24, border: '1px solid var(--border-light)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>⚡</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{user.plan === 'free' ? 'Basic' : 'Priority'}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Processing Speed</div>
                </div>
                <div style={{ background: 'var(--bg-primary)', borderRadius: 20, padding: 24, border: '1px solid var(--border-light)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🛡️</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>Secure</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Cloud Storage</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 24, padding: 32, boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recent Files</h3>
                  <button style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontWeight: 600, cursor: 'pointer' }}>View All</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {history.length > 0 ? history.slice(0, 5).map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 16, border: '1px solid #f8fafc', transition: 'all 0.2s', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-card)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                        📄
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.outputFile?.name || 'Processed File'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{formatDate(item.createdAt)} • {formatBytes(item.outputFile?.size || 0)}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {item.outputFile?.url && (
                          <>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(item.outputFile.url);
                                toast.success('Link copied! 📋');
                              }}
                              style={{ padding: '8px', borderRadius: 8, background: 'var(--bg-card)', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
                              title="Copy URL"
                            >
                              🔗
                            </button>
                            <a href={item.outputFile.url} download style={{ padding: '8px', borderRadius: 8, background: 'var(--bg-card)', color: 'var(--text-secondary)', textDecoration: 'none' }}>⬇️</a>
                          </>
                        )}
                        <button style={{ padding: '8px', borderRadius: 8, background: '#fef2f2', border: 'none', color: '#ef4444', cursor: 'pointer' }}>🗑️</button>
                      </div>
                    </div>
                  )) : (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                      <div style={{ fontSize: '3rem', marginBottom: 16 }}>📁</div>
                      <p>No files processed yet. Start using our tools!</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
