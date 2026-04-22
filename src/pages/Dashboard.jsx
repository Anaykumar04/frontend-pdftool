import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { adminApi } from '../services/api'
import { formatBytes, formatDate } from '../utils/helpers'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getStats()
      .then(res => setStats(res.data))
      .catch(err => {
        console.error(err)
        toast.error('Failed to load dashboard statistics')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="dashboard-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (!stats) return null;

  return (
    <div className="dashboard-container" style={{ display: 'flex', background: '#f8fafc', minHeight: 'calc(100vh - 64px)', color: '#0f172a' }}>
      
      {/* Sidebar Overlay (Dark Theme for Sidebar as in image) */}
      <div className="admin-sidebar" style={{ width: 260, background: '#111827', color: '#f8fafc', display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'width 0.3s ease' }}>
        <div style={{ padding: '24px 20px', fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ background: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: 6, fontSize: '0.9rem' }}>PDF</div>
          <span className="sidebar-label">Toolkit</span>
        </div>

        <div style={{ padding: '20px 16px', flex: 1, overflowY: 'auto' }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#4f46e5', color: 'white', borderRadius: 8, textDecoration: 'none', fontWeight: 500, marginBottom: 24 }}>
            <span>🏠</span> <span className="sidebar-label">Dashboard</span>
          </Link>

          <div className="sidebar-label" style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, letterSpacing: 1, marginBottom: 12, paddingLeft: 16 }}>MANAGEMENT</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 24 }}>
            {[{i:'👥', l:'Users'}, {i:'📄', l:'Files'}, {i:'📊', l:'Tools Usage'}, {i:'💳', l:'Transactions'}].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', color: '#cbd5e1', cursor: 'pointer', borderRadius: 8 }}>
                <span>{item.i}</span> <span className="sidebar-label">{item.l}</span>
              </div>
            ))}
          </div>

          <div className="sidebar-label" style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, letterSpacing: 1, marginBottom: 12, paddingLeft: 16 }}>SYSTEM</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 24 }}>
            {[{i:'💾', l:'Storage'}, {i:'⚙️', l:'Settings'}, {i:'🛡️', l:'Security'}, {i:'📝', l:'Activity Logs'}].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', color: '#cbd5e1', cursor: 'pointer', borderRadius: 8 }}>
                <span>{item.i}</span> <span className="sidebar-label">{item.l}</span>
              </div>
            ))}
          </div>

          <div className="sidebar-label" style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, letterSpacing: 1, marginBottom: 12, paddingLeft: 16 }}>SUPPORT</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[{i:'🎧', l:'Help & Support'}, {i:'📈', l:'Reports'}].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', color: '#cbd5e1', cursor: 'pointer', borderRadius: 8 }}>
                <span>{item.i}</span> <span className="sidebar-label">{item.l}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-label" style={{ padding: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, #312e81, #1e1b4b)', borderRadius: 12, padding: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>👑</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Upgrade to Pro</div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 16 }}>Unlock more features and get unlimited access.</div>
            <button style={{ width: '100%', padding: '8px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: 6, fontWeight: 500, cursor: 'pointer' }}>Upgrade Now</button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: 'clamp(16px, 4vw, 40px)', overflowY: 'auto', height: 'calc(100vh - 64px)' }}>
        
        {/* Top Navbar Area Simulation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Dashboard</h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Welcome back, {user?.name?.split(' ')[0] || 'Admin'}! Here's what's happening with your PDF Toolkit.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', display: 'none' /* Hide search on mobile if needed */ }}>
              {/* Optional: Add @media query logic here if using external CSS, but for inline: */}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="admin-info-desktop">
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{user?.name || 'Admin User'}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Super Admin</div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Top Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          
          <div style={{ background: 'white', borderRadius: 12, padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ background: '#f3e8ff', color: '#a855f7', width: 50, height: 50, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>👥</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 4 }}>Total Users</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{stats.totalUsers.toLocaleString()}</div>
                <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>↑ 12.5%</div>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: 4 }}>vs last month</div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 12, padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ background: '#dbeafe', color: '#3b82f6', width: 50, height: 50, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📄</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 4 }}>Total Files Processed</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{stats.totalFilesProcessed.toLocaleString()}</div>
                <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>↑ 18.6%</div>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: 4 }}>vs last month</div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 12, padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ background: '#d1fae5', color: '#10b981', width: 50, height: 50, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📈</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 4 }}>Total Conversions</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{stats.totalConversions.toLocaleString()}</div>
                <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>↑ 15.3%</div>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: 4 }}>vs last month</div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 12, padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ background: '#fef3c7', color: '#f59e0b', width: 50, height: 50, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>💾</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 4 }}>Storage Used</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{formatBytes(stats.storageUsed)}</div>
                <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>↑ 10.8%</div>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: 4 }}>vs last month</div>
            </div>
          </div>

        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          
          {/* Line Chart */}
          <div style={{ background: 'white', borderRadius: 12, padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: 350, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f172a' }}>Files Processed Overview</h3>
              <select style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontSize: '0.85rem', outline: 'none' }}>
                <option>Last 7 Days</option>
              </select>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.filesProcessedOverview}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dx={-10} />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: 'white' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div style={{ background: 'white', borderRadius: 12, padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: 350, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f172a', marginBottom: 20 }}>Top Tools Usage</h3>
            <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.topToolsUsage}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {stats.topToolsUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.85rem' }}>
              {stats.topToolsUsage.slice(0, 4).map((tool, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: tool.color }} />
                    <div style={{ color: '#475569', fontWeight: 500 }}>{tool.name}</div>
                  </div>
                  <div style={{ color: '#64748b' }}>{tool.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ background: 'white', borderRadius: 12, padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: 350, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f172a' }}>Recent Activity</h3>
              <div style={{ fontSize: '0.8rem', color: '#3b82f6', cursor: 'pointer', fontWeight: 500, padding: '4px 8px', background: '#eff6ff', borderRadius: 4 }}>View All</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1, paddingRight: 8 }}>
              {stats.recentActivity.map((activity, i) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.2rem' }}>
                    📄
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', color: '#0f172a', lineHeight: 1.4 }}>
                      <span style={{ fontWeight: 600 }}>{activity.user}</span> {activity.action.split(' applied to ')[0].toLowerCase()} a file
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
                      {activity.action.split(' applied to ')[1]}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                    {formatDate(activity.time).split(',')[0]}
                  </div>
                </div>
              ))}
              {stats.recentActivity.length === 0 && (
                <div style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', marginTop: 20 }}>No recent activity.</div>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          {/* Recent Files Table */}
          <div style={{ background: 'white', borderRadius: 12, padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f172a' }}>Recent Files</h3>
              <div style={{ fontSize: '0.8rem', color: '#3b82f6', cursor: 'pointer', fontWeight: 500, padding: '4px 8px', background: '#eff6ff', borderRadius: 4 }}>View All</div>
            </div>
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '12px 0', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>File Name</th>
                  <th style={{ textAlign: 'left', padding: '12px 0', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>User</th>
                  <th style={{ textAlign: 'left', padding: '12px 0', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>Tool Used</th>
                  <th style={{ textAlign: 'left', padding: '12px 0', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>Size</th>
                  <th style={{ textAlign: 'left', padding: '12px 0', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>Date</th>
                  <th style={{ textAlign: 'right', padding: '12px 0', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentFiles.map(file => (
                  <tr key={file.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 0', display: 'flex', alignItems: 'center', gap: 12, color: '#0f172a', fontWeight: 500, fontSize: '0.9rem' }}>
                      <span style={{ color: '#ef4444' }}>📄</span> {file.fileName}
                    </td>
                    <td style={{ padding: '16px 0', color: '#475569', fontSize: '0.9rem' }}>{file.user}</td>
                    <td style={{ padding: '16px 0' }}><span style={{ padding: '4px 8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 4, color: '#475569', fontSize: '0.85rem' }}>{file.toolUsed}</span></td>
                    <td style={{ padding: '16px 0', color: '#475569', fontSize: '0.9rem' }}>{formatBytes(file.size)}</td>
                    <td style={{ padding: '16px 0', color: '#475569', fontSize: '0.9rem' }}>{formatDate(file.date).split(',')[0]}</td>
                    <td style={{ padding: '16px 0', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                         {file.url && (
                          <a href={file.url} download target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '1.2rem' }}>
                            ⬇️
                          </a>
                         )}
                         <span style={{ color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}>🗑️</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {stats.recentFiles.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: 30, color: '#94a3b8' }}>No files processed yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Storage Overview */}
          <div style={{ background: 'white', borderRadius: 12, padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f172a' }}>Storage Overview</h3>
              <div style={{ fontSize: '0.8rem', color: '#3b82f6', cursor: 'pointer', fontWeight: 500, padding: '4px 8px', background: '#eff6ff', borderRadius: 4 }}>View Details</div>
            </div>
            
            <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{formatBytes(stats.storageUsed)}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>of 1 TB Used</div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Used Space', value: stats.storageUsed, color: '#4f46e5' },
                      { name: 'Free Space', value: Math.max(0, 1024*1024*1024*1024 - stats.storageUsed), color: '#f1f5f9' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={95}
                    startAngle={220}
                    endAngle={-40}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    {
                      [
                        { name: 'Used Space', value: stats.storageUsed, color: '#4f46e5' },
                        { name: 'Free Space', value: Math.max(0, 1024*1024*1024*1024 - stats.storageUsed), color: '#f1f5f9' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))
                    }
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4f46e5' }} />
                  <span style={{ color: '#475569', fontWeight: 500 }}>Used Space</span>
                </div>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatBytes(stats.storageUsed)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#e2e8f0' }} />
                  <span style={{ color: '#475569', fontWeight: 500 }}>Free Space</span>
                </div>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatBytes(Math.max(0, 1024*1024*1024*1024 - stats.storageUsed))}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#0f172a' }} />
                  <span style={{ color: '#475569', fontWeight: 500 }}>Total Space</span>
                </div>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>1 TB</span>
              </div>
              
              <div style={{ marginTop: 8 }}>
                <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (stats.storageUsed / (1024*1024*1024*1024)) * 100)}%`, height: '100%', background: '#4f46e5' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: 8, fontWeight: 600 }}>
                  <span>{((stats.storageUsed / (1024*1024*1024*1024)) * 100).toFixed(2)}% Used</span>
                  <span>1 TB Total</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
