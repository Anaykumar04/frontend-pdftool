import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { adminApi } from '../services/api'
import { formatBytes, formatDate } from '../utils/helpers'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts'
import toast from 'react-hot-toast'

const CARD_STYLE = {
  background: 'rgba(30,41,59,0.6)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.07)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
}

const COLORS = ['#8b5cf6','#3b82f6','#10b981','#f59e0b','#ec4899','#6366f1','#14b8a6']

// ── Edit User Modal ──────────────────────────────────────────────────────────
function EditUserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    role: user.role || 'user',
    plan: user.plan || 'free',
    isVerified: user.isVerified || false,
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await adminApi.updateUser(user._id, form)
      toast.success('User updated!')
      onSave()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to update user')
    } finally { setSaving(false) }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}>
      <div style={{ ...CARD_STYLE, width:460, maxWidth:'95vw', padding:32 }}>
        <h3 style={{ color:'#e2e8f0', fontWeight:700, marginBottom:24, fontSize:'1.1rem' }}>✏️ Edit User</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {[['Name','name','text'],['Email','email','email']].map(([label,key,type]) => (
            <div key={key}>
              <label style={{ fontSize:'0.8rem', color:'#94a3b8', display:'block', marginBottom:6 }}>{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})}
                style={{ width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'#e2e8f0', outline:'none', boxSizing:'border-box' }} />
            </div>
          ))}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div>
              <label style={{ fontSize:'0.8rem', color:'#94a3b8', display:'block', marginBottom:6 }}>Role</label>
              <select value={form.role} onChange={e => setForm({...form, role:e.target.value})}
                style={{ width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)', background:'#1e293b', color:'#e2e8f0', outline:'none' }}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize:'0.8rem', color:'#94a3b8', display:'block', marginBottom:6 }}>Plan</label>
              <select value={form.plan} onChange={e => setForm({...form, plan:e.target.value})}
                style={{ width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)', background:'#1e293b', color:'#e2e8f0', outline:'none' }}>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
          <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', color:'#94a3b8', fontSize:'0.9rem' }}>
            <input type="checkbox" checked={form.isVerified} onChange={e => setForm({...form, isVerified:e.target.checked})} />
            Email Verified
          </label>
        </div>
        <div style={{ display:'flex', gap:12, marginTop:24 }}>
          <button onClick={onClose} style={{ flex:1, padding:'10px', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'#94a3b8', cursor:'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving}
            style={{ flex:1, padding:'10px', borderRadius:8, border:'none', background:'#8b5cf6', color:'white', fontWeight:600, cursor:'pointer' }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [editUser, setEditUser] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const fetchStats = useCallback(() => {
    adminApi.getStats()
      .then(res => { setStats(res.data); setLoading(false) })
      .catch(err => { console.error(err); setLoading(false) })
  }, [])

  useEffect(() => {
    fetchStats()
    const id = setInterval(fetchStats, 10000)
    return () => clearInterval(id)
  }, [fetchStats])

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}"? This will also delete all their history.`)) return
    setDeletingId(userId)
    try {
      await adminApi.deleteUser(userId)
      toast.success('User deleted')
      fetchStats()
    } catch (err) {
      toast.error(err.message || 'Failed to delete user')
    } finally { setDeletingId(null) }
  }

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Delete this file record?')) return
    try {
      await adminApi.deleteHistory(fileId)
      toast.success('File record deleted')
      fetchStats()
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}>
      <div className="spinner" />
    </div>
  )

  if (!stats) return null

  const NAV = [
    { section:'OVERVIEW', items:[{ i:'🏠', l:'Dashboard' }] },
    { section:'MANAGEMENT', items:[{ i:'👥', l:'Users' }, { i:'📄', l:'Files' }, { i:'📊', l:'Tools Usage' }] },
    { section:'SYSTEM', items:[{ i:'📝', l:'Activity Logs' }] },
  ]

  return (
    <div style={{ display:'flex', background:'var(--bg-primary)', minHeight:'calc(100vh - 64px)', color:'var(--text-primary)', position:'relative' }}>
      {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} onSave={fetchStats} />}

      {/* Background orbs */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0 }}>
        <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'var(--accent-purple)', filter:'blur(150px)', opacity:0.12, top:'-10%', right:'-5%' }} />
        <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:'var(--accent-cyan)', filter:'blur(150px)', opacity:0.08, bottom:'-20%', left:'-10%' }} />
      </div>

      {/* Sidebar */}
      <div style={{ width:240, background:'rgba(10,15,30,0.6)', backdropFilter:'blur(20px)', borderRight:'1px solid rgba(255,255,255,0.05)', display:'flex', flexDirection:'column', flexShrink:0, zIndex:1 }}>
        <div style={{ padding:'20px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ background:'#8b5cf6', color:'white', padding:'4px 8px', borderRadius:6, fontSize:'0.85rem', fontWeight:700 }}>PDF</div>
          <span style={{ fontWeight:700, color:'white' }}>Toolkit Admin</span>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'16px 12px' }}>
          {NAV.map(({ section, items }) => (
            <div key={section} style={{ marginBottom:20 }}>
              <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.35)', fontWeight:700, letterSpacing:1.5, paddingLeft:12, marginBottom:8 }}>{section}</div>
              {items.map(({ i, l }) => (
                <div key={l} onClick={() => setActiveTab(l)}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:8, cursor:'pointer', marginBottom:2, background: activeTab===l ? 'rgba(139,92,246,0.2)' : 'transparent', color: activeTab===l ? '#c4b5fd' : 'rgba(255,255,255,0.7)', fontWeight: activeTab===l ? 600 : 400, transition:'all 0.15s' }}>
                  <span>{i}</span><span>{l}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ padding:16 }}>
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', borderRadius:8, color:'rgba(255,255,255,0.5)', textDecoration:'none', fontSize:'0.85rem' }}>
            ← Back to Site
          </Link>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, overflowY:'auto', height:'calc(100vh - 64px)', padding:'clamp(16px,3vw,36px)', zIndex:1 }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28, flexWrap:'wrap', gap:16 }}>
          <div>
            <h1 style={{ fontSize:'1.4rem', fontWeight:700, marginBottom:4 }}>{activeTab}</h1>
            <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem' }}>Welcome back, {user?.name?.split(' ')[0]}! Real-time data updates every 10s.</p>
          </div>
          <Link to="/profile" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', background:'rgba(255,255,255,0.05)', padding:'8px 16px', borderRadius:30, border:'1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'#8b5cf6', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, overflow:'hidden' }}>
              {user?.avatar ? <img src={user.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--text-primary)' }}>{user?.name}</div>
              <div style={{ fontSize:'0.7rem', color:'#8b5cf6' }}>Admin</div>
            </div>
          </Link>
        </div>

        {/* ── DASHBOARD TAB ── */}
        {activeTab === 'Dashboard' && (
          <>
            {/* Stat Cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16, marginBottom:24 }}>
              {[
                { icon:'👥', label:'Total Users', value:stats.totalUsers?.toLocaleString()||'0', color:'#8b5cf6', bg:'rgba(139,92,246,0.1)' },
                { icon:'📄', label:'Files Processed', value:stats.totalFilesProcessed?.toLocaleString()||'0', color:'#3b82f6', bg:'rgba(59,130,246,0.1)' },
                { icon:'📈', label:'Conversions', value:stats.totalConversions?.toLocaleString()||'0', color:'#10b981', bg:'rgba(16,185,129,0.1)' },
                { icon:'💾', label:'Storage Used', value:formatBytes(stats.storageUsed||0), color:'#f59e0b', bg:'rgba(245,158,11,0.1)' },
              ].map(({ icon, label, value, color, bg }) => (
                <div key={label} style={{ ...CARD_STYLE, padding:20, display:'flex', alignItems:'center', gap:16 }}>
                  <div style={{ width:48, height:48, borderRadius:12, background:bg, color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0 }}>{icon}</div>
                  <div>
                    <div style={{ color:'var(--text-secondary)', fontSize:'0.8rem', marginBottom:4 }}>{label}</div>
                    <div style={{ fontSize:'1.4rem', fontWeight:700, color:'var(--text-primary)' }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:16, marginBottom:24 }}>
              {/* Line Chart */}
              <div style={{ ...CARD_STYLE, padding:24, height:300 }}>
                <h3 style={{ fontSize:'0.95rem', fontWeight:600, marginBottom:16, color:'var(--text-primary)' }}>Files Processed — Last 7 Days</h3>
                <ResponsiveContainer width="100%" height="85%">
                  <LineChart data={stats.filesProcessedOverview || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize:11, fill:'#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize:11, fill:'#64748b' }} allowDecimals={false} />
                    <RechartsTooltip contentStyle={{ background:'#1e293b', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#e2e8f0' }} />
                    <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r:4, fill:'#8b5cf6' }} activeDot={{ r:6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart */}
              <div style={{ ...CARD_STYLE, padding:24, height:300 }}>
                <h3 style={{ fontSize:'0.95rem', fontWeight:600, marginBottom:16, color:'var(--text-primary)' }}>Top Tools Usage</h3>
                {stats.topToolsUsage?.length > 0 ? (
                  <div style={{ display:'flex', gap:16, height:'85%' }}>
                    <ResponsiveContainer width="55%" height="100%">
                      <PieChart>
                        <Pie data={stats.topToolsUsage} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2} dataKey="value">
                          {stats.topToolsUsage.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <RechartsTooltip contentStyle={{ background:'#1e293b', border:'none', borderRadius:8, color:'#e2e8f0' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', gap:8, overflowY:'auto' }}>
                      {stats.topToolsUsage.slice(0,6).map((t, i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:'0.78rem' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <div style={{ width:8, height:8, borderRadius:'50%', background:t.color, flexShrink:0 }} />
                            <span style={{ color:'var(--text-secondary)' }}>{t.name}</span>
                          </div>
                          <span style={{ fontWeight:600, color:'var(--text-primary)' }}>{t.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'85%', color:'var(--text-secondary)', fontSize:'0.9rem' }}>No data yet</div>
                )}
              </div>

              {/* Bar Chart */}
              <div style={{ ...CARD_STYLE, padding:24, height:300 }}>
                <h3 style={{ fontSize:'0.95rem', fontWeight:600, marginBottom:16, color:'var(--text-primary)' }}>Tool Breakdown</h3>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={(stats.topToolsUsage||[]).slice(0,6)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize:10, fill:'#64748b' }} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize:10, fill:'#94a3b8' }} width={80} />
                    <RechartsTooltip contentStyle={{ background:'#1e293b', border:'none', borderRadius:8, color:'#e2e8f0' }} />
                    <Bar dataKey="value" radius={[0,4,4,0]}>
                      {(stats.topToolsUsage||[]).slice(0,6).map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{ ...CARD_STYLE, padding:24 }}>
              <h3 style={{ fontSize:'0.95rem', fontWeight:600, marginBottom:16, color:'var(--text-primary)' }}>Recent Activity</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {(stats.recentActivity||[]).length === 0 && (
                  <div style={{ color:'var(--text-secondary)', textAlign:'center', padding:20 }}>No activity yet.</div>
                )}
                {(stats.recentActivity||[]).map((a, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ width:36, height:36, borderRadius:8, background:'rgba(139,92,246,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>📄</div>
                    <div style={{ flex:1 }}>
                      <span style={{ fontWeight:600, color:'var(--text-primary)', fontSize:'0.85rem' }}>{a.user}</span>
                      <span style={{ color:'var(--text-secondary)', fontSize:'0.85rem' }}> — {a.action}</span>
                    </div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', whiteSpace:'nowrap' }}>{formatDate(a.time)}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === 'Users' && (
          <div style={{ ...CARD_STYLE, padding:24, overflowX:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ fontSize:'0.95rem', fontWeight:600, color:'var(--text-primary)' }}>All Users ({stats.usersList?.length || 0})</h3>
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:700 }}>
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                  {['User','Email','Role','Plan','Verified','Joined','Actions'].map(h => (
                    <th key={h} style={{ textAlign:'left', padding:'10px 12px', color:'#64748b', fontSize:'0.78rem', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(stats.usersList||[]).map(u => (
                  <tr key={u._id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', transition:'background 0.15s' }}
                    onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                    onMouseOut={e => e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'12px', color:'var(--text-primary)', fontWeight:500, fontSize:'0.88rem' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:32, height:32, borderRadius:'50%', background:'#8b5cf6', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'0.85rem', overflow:'hidden', flexShrink:0 }}>
                          {u.avatar ? <img src={u.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : u.name?.charAt(0).toUpperCase()}
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td style={{ padding:'12px', color:'var(--text-secondary)', fontSize:'0.85rem' }}>{u.email}</td>
                    <td style={{ padding:'12px' }}>
                      <span style={{ padding:'3px 10px', borderRadius:20, fontSize:'0.75rem', fontWeight:600, background: u.role==='admin' ? 'rgba(139,92,246,0.15)' : 'rgba(59,130,246,0.1)', color: u.role==='admin' ? '#c4b5fd' : '#93c5fd' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding:'12px' }}>
                      <span style={{ padding:'3px 10px', borderRadius:20, fontSize:'0.75rem', fontWeight:600, background: u.plan==='free' ? 'rgba(100,116,139,0.15)' : 'rgba(16,185,129,0.15)', color: u.plan==='free' ? '#94a3b8' : '#6ee7b7' }}>
                        {u.plan}
                      </span>
                    </td>
                    <td style={{ padding:'12px' }}>
                      <span style={{ fontSize:'1rem' }}>{u.isVerified ? '✅' : '❌'}</span>
                    </td>
                    <td style={{ padding:'12px', color:'var(--text-secondary)', fontSize:'0.82rem' }}>{formatDate(u.createdAt).split(',')[0]}</td>
                    <td style={{ padding:'12px' }}>
                      <div style={{ display:'flex', gap:8 }}>
                        <button onClick={() => setEditUser(u)}
                          style={{ padding:'6px 12px', borderRadius:6, border:'1px solid rgba(139,92,246,0.3)', background:'rgba(139,92,246,0.1)', color:'#c4b5fd', cursor:'pointer', fontSize:'0.8rem', fontWeight:600 }}>
                          ✏️ Edit
                        </button>
                        <button onClick={() => handleDeleteUser(u._id, u.name)} disabled={deletingId===u._id}
                          style={{ padding:'6px 12px', borderRadius:6, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.1)', color:'#fca5a5', cursor:'pointer', fontSize:'0.8rem', fontWeight:600 }}>
                          {deletingId===u._id ? '...' : '🗑️ Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── FILES TAB ── */}
        {activeTab === 'Files' && (
          <div style={{ ...CARD_STYLE, padding:24, overflowX:'auto' }}>
            <h3 style={{ fontSize:'0.95rem', fontWeight:600, color:'var(--text-primary)', marginBottom:20 }}>Recent Files ({stats.recentFiles?.length || 0})</h3>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:700 }}>
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                  {['File','User','Tool','Size','Date','Action'].map(h => (
                    <th key={h} style={{ textAlign:'left', padding:'10px 12px', color:'#64748b', fontSize:'0.78rem', fontWeight:600, textTransform:'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(stats.recentFiles||[]).map(f => (
                  <tr key={f.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding:'12px', color:'var(--text-primary)', fontSize:'0.85rem', fontWeight:500 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ color:'#ef4444' }}>📄</span>
                        <span style={{ maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.fileName}</span>
                      </div>
                    </td>
                    <td style={{ padding:'12px', color:'var(--text-secondary)', fontSize:'0.85rem' }}>{f.user}</td>
                    <td style={{ padding:'12px' }}>
                      <span style={{ padding:'3px 8px', borderRadius:4, background:'rgba(59,130,246,0.1)', color:'#93c5fd', fontSize:'0.78rem' }}>{f.toolUsed}</span>
                    </td>
                    <td style={{ padding:'12px', color:'var(--text-secondary)', fontSize:'0.85rem' }}>{formatBytes(f.size)}</td>
                    <td style={{ padding:'12px', color:'var(--text-secondary)', fontSize:'0.82rem' }}>{formatDate(f.date).split(',')[0]}</td>
                    <td style={{ padding:'12px' }}>
                      <div style={{ display:'flex', gap:8 }}>
                        {f.url && (
                          <a href={f.url.startsWith('http://') ? f.url.replace('http://','https://') : f.url} target="_blank" rel="noreferrer"
                            style={{ padding:'5px 10px', borderRadius:6, border:'1px solid rgba(59,130,246,0.3)', background:'rgba(59,130,246,0.1)', color:'#93c5fd', textDecoration:'none', fontSize:'0.8rem' }}>
                            ⬇️
                          </a>
                        )}
                        <button onClick={() => handleDeleteFile(f.id)}
                          style={{ padding:'5px 10px', borderRadius:6, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.1)', color:'#fca5a5', cursor:'pointer', fontSize:'0.8rem' }}>
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(stats.recentFiles||[]).length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign:'center', padding:30, color:'var(--text-secondary)' }}>No files yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── TOOLS USAGE TAB ── */}
        {activeTab === 'Tools Usage' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:16 }}>
            <div style={{ ...CARD_STYLE, padding:24, height:400 }}>
              <h3 style={{ fontSize:'0.95rem', fontWeight:600, color:'var(--text-primary)', marginBottom:16 }}>Tools Usage Chart</h3>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={stats.topToolsUsage||[]} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize:11, fill:'#64748b' }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize:11, fill:'#94a3b8' }} width={100} />
                  <RechartsTooltip contentStyle={{ background:'#1e293b', border:'none', borderRadius:8, color:'#e2e8f0' }} />
                  <Bar dataKey="value" radius={[0,6,6,0]}>
                    {(stats.topToolsUsage||[]).map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ ...CARD_STYLE, padding:24 }}>
              <h3 style={{ fontSize:'0.95rem', fontWeight:600, color:'var(--text-primary)', marginBottom:16 }}>Usage Breakdown</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {(stats.topToolsUsage||[]).map((t, i) => {
                  const total = (stats.topToolsUsage||[]).reduce((s, x) => s + x.value, 0)
                  const pct = total > 0 ? Math.round((t.value / total) * 100) : 0
                  return (
                    <div key={i}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:'0.85rem' }}>
                        <span style={{ color:'var(--text-primary)', fontWeight:500 }}>{t.name}</span>
                        <span style={{ color:'var(--text-secondary)' }}>{t.value} ({pct}%)</span>
                      </div>
                      <div style={{ height:6, borderRadius:3, background:'rgba(255,255,255,0.05)', overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${pct}%`, background:t.color, borderRadius:3, transition:'width 0.5s' }} />
                      </div>
                    </div>
                  )
                })}
                {(stats.topToolsUsage||[]).length === 0 && (
                  <div style={{ color:'var(--text-secondary)', textAlign:'center', padding:20 }}>No tool usage data yet.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── ACTIVITY LOGS TAB ── */}
        {activeTab === 'Activity Logs' && (
          <div style={{ ...CARD_STYLE, padding:24 }}>
            <h3 style={{ fontSize:'0.95rem', fontWeight:600, color:'var(--text-primary)', marginBottom:20 }}>Activity Logs</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
              {(stats.recentActivity||[]).map((a, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'#8b5cf6', flexShrink:0 }} />
                  <div style={{ flex:1 }}>
                    <span style={{ fontWeight:600, color:'var(--text-primary)', fontSize:'0.88rem' }}>{a.user}</span>
                    <span style={{ color:'var(--text-secondary)', fontSize:'0.88rem' }}> — {a.action}</span>
                  </div>
                  <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', whiteSpace:'nowrap' }}>{formatDate(a.time)}</div>
                </div>
              ))}
              {(stats.recentActivity||[]).length === 0 && (
                <div style={{ color:'var(--text-secondary)', textAlign:'center', padding:30 }}>No activity logged yet.</div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

