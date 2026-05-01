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
  const [activeTab, setActiveTab] = useState('Dashboard')

  useEffect(() => {
    const fetchStats = () => {
      adminApi.getStats()
        .then(res => setStats(res.data))
        .catch(err => {
          console.error(err)
        })
        .finally(() => setLoading(false))
    }

    fetchStats()
    const intervalId = setInterval(fetchStats, 5000) // Poll every 5 seconds

    return () => clearInterval(intervalId)
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
    <div className="dashboard-container" style={{ display: 'flex', background: 'var(--bg-primary)', minHeight: 'calc(100vh - 64px)', color: 'var(--text-primary)', position: 'relative', overflow: 'hidden' }}>

      {/* Background orbs for glassmorphism */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'var(--accent-purple)', filter: 'blur(150px)', opacity: 0.15, top: '-10%', right: '-5%' }} />
        <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'var(--accent-cyan)', filter: 'blur(150px)', opacity: 0.1, bottom: '-20%', left: '-10%' }} />
      </div>

      {/* Sidebar Overlay (Dark Theme for Sidebar as in image) */}
      <div className="admin-sidebar" style={{ width: 260, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255, 255, 255, 0.05)', color: 'white', display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'width 0.3s ease', zIndex: 1 }}>
        <div style={{ padding: '24px 20px', fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ background: 'var(--navbar-light)', color: 'white', padding: '4px 8px', borderRadius: 6, fontSize: '0.9rem' }}>PDF</div>
          <span className="sidebar-label">Toolkit</span>
        </div>

        <div style={{ padding: '20px 16px', flex: 1, overflowY: 'auto' }}>
          <div onClick={() => setActiveTab('Dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: activeTab === 'Dashboard' ? 'var(--navbar-light)' : 'transparent', color: activeTab === 'Dashboard' ? 'white' : 'rgba(255, 255, 255, 0.8)', borderRadius: 8, cursor: 'pointer', fontWeight: 500, marginBottom: 24, transition: '0.2s' }}>
            <span>🏠</span> <span className="sidebar-label">Dashboard</span>
          </div>

          <div className="sidebar-label" style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600, letterSpacing: 1, marginBottom: 12, paddingLeft: 16 }}>MANAGEMENT</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 24 }}>
            {[{ i: '👥', l: 'Users' }, { i: '📄', l: 'Files' }, { i: '📊', l: 'Tools Usage' }, { i: '💳', l: 'Transactions' }].map((item, i) => (
              <div key={i} onClick={() => setActiveTab(item.l)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', color: activeTab === item.l ? 'white' : 'rgba(255, 255, 255, 0.8)', background: activeTab === item.l ? 'var(--navbar-light)' : 'transparent', cursor: 'pointer', borderRadius: 8, transition: '0.2s' }}>
                <span>{item.i}</span> <span className="sidebar-label">{item.l}</span>
              </div>
            ))}
          </div>

          <div className="sidebar-label" style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600, letterSpacing: 1, marginBottom: 12, paddingLeft: 16 }}>SYSTEM</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 24 }}>
            {[{ i: '💾', l: 'Storage' }, { i: '⚙️', l: 'Settings' }, { i: '🛡️', l: 'Security' }, { i: '📝', l: 'Activity Logs' }].map((item, i) => (
              <div key={i} onClick={() => setActiveTab(item.l)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', color: activeTab === item.l ? 'white' : 'rgba(255, 255, 255, 0.8)', background: activeTab === item.l ? 'var(--navbar-light)' : 'transparent', cursor: 'pointer', borderRadius: 8, transition: '0.2s' }}>
                <span>{item.i}</span> <span className="sidebar-label">{item.l}</span>
              </div>
            ))}
          </div>

          <div className="sidebar-label" style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600, letterSpacing: 1, marginBottom: 12, paddingLeft: 16 }}>SUPPORT</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[{ i: '🎧', l: 'Help & Support' }, { i: '📈', l: 'Reports' }].map((item, i) => (
              <div key={i} onClick={() => setActiveTab(item.l)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', color: activeTab === item.l ? 'white' : 'rgba(255, 255, 255, 0.8)', background: activeTab === item.l ? 'var(--navbar-light)' : 'transparent', cursor: 'pointer', borderRadius: 8, transition: '0.2s' }}>
                <span>{item.i}</span> <span className="sidebar-label">{item.l}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-label" style={{ padding: '20px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>👑</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Upgrade to Pro</div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 16 }}>Unlock more features and get unlimited access.</div>
            <button onClick={() => toast.success('Upgrade process initiated!')} style={{ width: '100%', padding: '8px', background: 'var(--accent-cyan)', color: 'white', border: 'none', borderRadius: 6, fontWeight: 500, cursor: 'pointer' }}>Upgrade Now</button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: 'clamp(16px, 4vw, 40px)', overflowY: 'auto', height: 'calc(100vh - 64px)', zIndex: 1, position: 'relative' }}>

        {/* Top Navbar Area Simulation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{activeTab}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Welcome back, {user?.name?.split(' ')[0] || 'Admin'}! Here's what's happening with your PDF Toolkit.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', cursor: 'pointer', background: 'var(--bg-card)', padding: '6px 16px 6px 6px', borderRadius: 30, border: '1px solid var(--border)', transition: 'all 0.2s' }} className="admin-profile-btn">
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-btn)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="admin-info-desktop">
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user?.name || 'Admin User'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Admin </div>
              </div>
            </Link>
          </div>
        </div>

        {activeTab === 'Dashboard' && (
          <>
            {/* 4 Top Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>

              <div style={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: 12, padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', width: 50, height: 50, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>👥</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 4 }}>Total Users</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.totalUsers.toLocaleString()}</div>
                    <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>↑ 12.5%</div>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>vs last month</div>
                </div>
              </div>

              <div style={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: 12, padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', width: 50, height: 50, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📄</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 4 }}>Total Files Processed</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.totalFilesProcessed.toLocaleString()}</div>
                    <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>↑ 18.6%</div>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>vs last month</div>
                </div>
              </div>

              <div style={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: 12, padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: 50, height: 50, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📈</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 4 }}>Total Conversions</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.totalConversions.toLocaleString()}</div>
                    <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>↑ 15.3%</div>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>vs last month</div>
                </div>
              </div>

              <div style={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: 12, padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', width: 50, height: 50, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>💾</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 4 }}>Storage Used</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatBytes(stats.storageUsed)}</div>
                    <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>↑ 10.8%</div>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>vs last month</div>
                </div>
              </div>

            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>

              {/* Line Chart */}
              <div style={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: 12, padding: '24px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', height: 350, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>Files Processed Overview</h3>
                  <select style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}>
                    <option>Last 7 Days</option>
                  </select>
                </div>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.filesProcessedOverview}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#cbd5e1' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#cbd5e1' }} dx={-10} />
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }} />
                      <Line type="monotone" dataKey="count" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#1e293b', stroke: '#a855f7' }} activeDot={{ r: 6, fill: '#a855f7' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div style={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: 12, padding: '24px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', height: 350, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>Top Tools Usage</h3>
                <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                  {stats.topToolsUsage?.length > 0 ? (
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
                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', background: 'var(--bg-secondary)', color: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      No tool usage data yet.
                    </div>
                  )}
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.85rem' }}>
                  {stats.topToolsUsage?.slice(0, 4).map((tool, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: tool.color }} />
                        <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{tool.name}</div>
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>{tool.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div style={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: 12, padding: '24px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', height: 350, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>Recent Activity</h3>
                  <div onClick={() => toast('Loading all activities...', { icon: '🔄' })} style={{ fontSize: '0.8rem', color: '#3b82f6', cursor: 'pointer', fontWeight: 500, padding: '4px 8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 4 }}>View All</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1, paddingRight: 8 }}>
                  {stats.recentActivity.map((activity, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.2rem' }}>
                        📄
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                          <span style={{ fontWeight: 600 }}>{activity.user}</span> {activity.action.split(' applied to ')[0].toLowerCase()} a file
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                          {activity.action.split(' applied to ')[1]}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {formatDate(activity.time).split(',')[0]}
                      </div>
                    </div>
                  ))}
                  {stats.recentActivity.length === 0 && (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', marginTop: 20 }}>No recent activity.</div>
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>

              {/* Recent Files Table */}
              <div style={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: 12, padding: '24px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', overflowX: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>Recent Files</h3>
                  <div onClick={() => toast('Fetching all recent files...', { icon: '📄' })} style={{ fontSize: '0.8rem', color: '#3b82f6', cursor: 'pointer', fontWeight: 500, padding: '4px 8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 4 }}>View All</div>
                </div>
                <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>File Name</th>
                      <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>User</th>
                      <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Tool Used</th>
                      <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Size</th>
                      <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Date</th>
                      <th style={{ textAlign: 'right', padding: '12px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentFiles.map(file => (
                      <tr key={file.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '16px 0', display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.9rem' }}>
                          <span style={{ color: '#ef4444' }}>📄</span> {file.fileName}
                        </td>
                        <td style={{ padding: '16px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{file.user}</td>
                        <td style={{ padding: '16px 0' }}><span style={{ padding: '4px 8px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{file.toolUsed}</span></td>
                        <td style={{ padding: '16px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{formatBytes(file.size)}</td>
                        <td style={{ padding: '16px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{formatDate(file.date).split(',')[0]}</td>
                        <td style={{ padding: '16px 0', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                            {file.url && (
                              <a href={file.url} download target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '1.2rem' }}>
                                ⬇️
                              </a>
                            )}
                            <span onClick={() => toast.error('File deleted!')} style={{ color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}>🗑️</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {stats.recentFiles.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: 30, color: 'var(--text-secondary)' }}>No files processed yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Storage Overview */}
              <div style={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: 12, padding: '24px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>Storage Overview</h3>
                  <div onClick={() => toast('Loading storage details...', { icon: '💾' })} style={{ fontSize: '0.8rem', color: '#3b82f6', cursor: 'pointer', fontWeight: 500, padding: '4px 8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 4 }}>View Details</div>
                </div>

                <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                  <div style={{ position: 'absolute', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatBytes(stats.storageUsed)}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>of 1 TB Used</div>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Used Space', value: stats.storageUsed, color: '#a855f7' },
                          { name: 'Free Space', value: Math.max(0, 1024 * 1024 * 1024 * 1024 - stats.storageUsed), color: 'var(--bg-secondary)' }
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
                            { name: 'Used Space', value: stats.storageUsed, color: '#a855f7' },
                            { name: 'Free Space', value: Math.max(0, 1024 * 1024 * 1024 * 1024 - stats.storageUsed), color: 'var(--bg-secondary)' }
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
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#a855f7' }} />
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Used Space</span>
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatBytes(stats.storageUsed)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--border)' }} />
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Free Space</span>
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatBytes(Math.max(0, 1024 * 1024 * 1024 * 1024 - stats.storageUsed))}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--text-primary)' }} />
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Total Space</span>
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>1 TB</span>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <div style={{ width: '100%', height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, (stats.storageUsed / (1024 * 1024 * 1024 * 1024)) * 100)}%`, height: '100%', background: '#a855f7' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 8, fontWeight: 600 }}>
                      <span>{((stats.storageUsed / (1024 * 1024 * 1024 * 1024)) * 100).toFixed(2)}% Used</span>
                      <span>1 TB Total</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </>
        )}

        {activeTab === 'Users' && (
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: 12, padding: '24px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', overflowX: 'auto', animation: 'fadeUp 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>All Users</h3>
              <div style={{ fontSize: '0.8rem', color: '#a855f7', fontWeight: 500, padding: '6px 12px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: 6, border: '1px solid rgba(168, 85, 247, 0.2)' }}>Total: {stats.usersList?.length || 0}</div>
            </div>
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Role</th>
                  <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {stats.usersList?.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '16px 0', color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        {u.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      {u.name}
                    </td>
                    <td style={{ padding: '16px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{u.email}</td>
                    <td style={{ padding: '16px 0' }}><span style={{ padding: '4px 8px', background: u.role === 'admin' ? 'rgba(168, 85, 247, 0.1)' : 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 4, color: u.role === 'admin' ? '#a855f7' : 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'capitalize', fontWeight: u.role === 'admin' ? 600 : 400 }}>{u.role}</span></td>
                    <td style={{ padding: '16px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{formatDate(u.createdAt).split(',')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Files' && (
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: 12, padding: '24px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', overflowX: 'auto', animation: 'fadeUp 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>All Processed Files</h3>
              <div style={{ fontSize: '0.8rem', color: '#a855f7', fontWeight: 500, padding: '6px 12px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: 6, border: '1px solid rgba(168, 85, 247, 0.2)' }}>Total: {stats.allFiles?.length || 0}</div>
            </div>
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>File Name</th>
                  <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>User</th>
                  <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Tool Used</th>
                  <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Size</th>
                  <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Date</th>
                  <th style={{ textAlign: 'right', padding: '12px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Download</th>
                </tr>
              </thead>
              <tbody>
                {stats.allFiles?.map(file => (
                  <tr key={file.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '16px 0', color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.9rem' }}><span style={{ color: '#ef4444', marginRight: 8 }}>📄</span> {file.fileName}</td>
                    <td style={{ padding: '16px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{file.user}</td>
                    <td style={{ padding: '16px 0' }}><span style={{ padding: '4px 8px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{file.toolUsed}</span></td>
                    <td style={{ padding: '16px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{formatBytes(file.size)}</td>
                    <td style={{ padding: '16px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{formatDate(file.date).split(',')[0]}</td>
                    <td style={{ padding: '16px 0', textAlign: 'right' }}>
                      {file.url && (
                        <a href={file.url} download target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: 6, textDecoration: 'none', transition: '0.2s' }}>
                          ⬇️
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Transactions' && (
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: 12, padding: '24px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', overflowX: 'auto', animation: 'fadeUp 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>System Transactions</h3>
              <div style={{ fontSize: '0.8rem', color: '#a855f7', fontWeight: 500, padding: '6px 12px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: 6, border: '1px solid rgba(168, 85, 247, 0.2)' }}>Real-time Feed</div>
            </div>
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Transaction ID</th>
                  <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>User</th>
                  <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Action</th>
                  <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Time</th>
                  <th style={{ textAlign: 'right', padding: '12px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentActivity?.map(activity => (
                  <tr key={activity.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '16px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'monospace' }}>TXN-{activity.id.substring(0, 8).toUpperCase()}</td>
                    <td style={{ padding: '16px 0', color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.9rem' }}>{activity.user}</td>
                    <td style={{ padding: '16px 0', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{activity.action}</td>
                    <td style={{ padding: '16px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{formatDate(activity.time)}</td>
                    <td style={{ padding: '16px 0', textAlign: 'right' }}>
                      <span style={{ padding: '4px 8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 4, color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>SUCCESS</span>
                    </td>
                  </tr>
                ))}
                {stats.recentActivity?.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: 30, color: 'var(--text-secondary)' }}>No transactions yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!['Dashboard', 'Users', 'Files', 'Transactions'].includes(activeTab) && (
          <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: '60px 20px', textAlign: 'center', border: '1px solid var(--border-light)', animation: 'fadeUp 0.3s ease-out' }}>
            <div style={{ fontSize: '4rem', marginBottom: 20 }}>🚧</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>{activeTab} Module</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto' }}>This management module is currently under development. Real-time metrics will be connected shortly.</p>
          </div>
        )}

      </div>
    </div>
  )
}
