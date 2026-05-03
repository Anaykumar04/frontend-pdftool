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

  const handleDeleteHistory = async (id) => {
    try {
      await historyApi.delete(id)
      setHistory(prev => prev.filter(h => h._id !== id))
      toast.success('File removed from history')
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  if (!user) return null

  return (
    <div className="profile-page" style={{ position: 'relative', overflow: 'hidden', padding: '40px 20px', minHeight: 'calc(100vh - 64px)', color: 'var(--text-primary)' }}>
      {/* Background orbs for glassmorphism */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'var(--accent-purple)', filter: 'blur(150px)', opacity: 0.15, top: '-10%', left: '-5%' }} />
        <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'var(--accent-cyan)', filter: 'blur(150px)', opacity: 0.1, bottom: '-20%', right: '-10%' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 40, maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Profile Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: 24, padding: 32, boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)' }}>
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
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Account Type</span>
                <span style={{ fontWeight: 600, color: '#10b981' }}>Free Forever</span>
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

          <div style={{ background: 'rgba(139,92,246,0.1)', borderRadius: 24, padding: 32, border: '1px solid rgba(139,92,246,0.2)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>🎉 All Tools Free</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 0, lineHeight: 1.6 }}>Every PDF tool is completely free to use. No limits, no subscriptions, no hidden fees.</p>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {editing ? (
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: 24, padding: 40, boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 24 }}>Update Account Information</h3>
              <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: '#64748b' }}>Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-secondary)', outline: 'none', color: 'var(--text-primary)', fontWeight: 500 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: '#64748b' }}>Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-secondary)', outline: 'none', color: 'var(--text-primary)', fontWeight: 500 }}
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
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-secondary)', outline: 'none', color: 'var(--text-primary)', fontWeight: 500 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: '#64748b' }}>Full Address</label>
                  <textarea
                    rows="3"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-secondary)', outline: 'none', resize: 'none', color: 'var(--text-primary)', fontWeight: 500 }}
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
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: 20, padding: 24, border: '1px solid var(--border-light)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>📄</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{history.length}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Files Processed</div>
                </div>
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: 20, padding: 24, border: '1px solid var(--border-light)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🔧</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{[...new Set(history.map(h => h.operation).filter(Boolean))].length}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Tools Used</div>
                </div>
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: 20, padding: 24, border: '1px solid var(--border-light)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🆓</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>Free</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Account Type</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div style={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: 24, padding: 32, boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recent Files</h3>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{history.length} total</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {history.length > 0 ? history.map((item, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:16, padding:16, borderRadius:16, border:'1px solid rgba(255,255,255,0.05)', transition:'all 0.2s', background:'rgba(30,41,59,0.3)' }}>
                      <div style={{ width:44, height:44, borderRadius:12, background:'rgba(139,92,246,0.1)', color:'#a78bfa', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>
                        📄
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:600, fontSize:'0.9rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.outputFile?.name || item.outputFile?.filename || 'Processed File'}</div>
                        <div style={{ fontSize:'0.78rem', color:'#64748b', marginTop:2 }}>
                          {formatDate(item.createdAt)} · {formatBytes(item.outputFile?.size || 0)}
                          {item.operation && <span style={{ marginLeft:8, padding:'2px 8px', borderRadius:10, background:'rgba(59,130,246,0.1)', color:'#93c5fd', fontSize:'0.72rem' }}>{item.operation.split('-').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ')}</span>}
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                        {item.outputFile?.url && (
                          <a href={item.outputFile.url.startsWith('http://') ? item.outputFile.url.replace('http://','https://') : item.outputFile.url}
                            download target="_blank" rel="noreferrer"
                            style={{ padding:'7px 10px', borderRadius:8, background:'rgba(59,130,246,0.1)', color:'#93c5fd', textDecoration:'none', fontSize:'0.9rem' }}
                            title="Download">⬇️</a>
                        )}
                        <button onClick={() => handleDeleteHistory(item._id)}
                          style={{ padding:'7px 10px', borderRadius:8, background:'rgba(239,68,68,0.1)', border:'none', color:'#fca5a5', cursor:'pointer', fontSize:'0.9rem' }}
                          title="Delete from history">🗑️</button>
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

