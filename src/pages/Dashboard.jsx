import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { historyApi } from '../services/api'
import { formatBytes, formatDate, getOperationLabel, downloadFile } from '../utils/helpers'
import toast from 'react-hot-toast'

const tools = [
  { to: '/tools/merge', icon: '🔗', label: 'Merge PDF', color: 'bg-purple' },
  { to: '/tools/split', icon: '✂️', label: 'Split PDF', color: 'bg-blue' },
  { to: '/tools/compress', icon: '📦', label: 'Compress PDF', color: 'bg-green' },
  { to: '/tools/rotate', icon: '🔄', label: 'Rotate PDF', color: 'bg-cyan' },
  { to: '/tools/watermark', icon: '💧', label: 'Watermark', color: 'bg-orange' },
  { to: '/tools/protect', icon: '🔒', label: 'Protect PDF', color: 'bg-red' },
  { to: '/tools/reorder', icon: '📋', label: 'Reorder', color: 'bg-indigo' },
  { to: '/tools/info', icon: '📊', label: 'PDF Info', color: 'bg-pink' },
  { to: '/tools/jpg-to-pdf', icon: '🖼️', label: 'JPG to PDF', color: 'bg-teal' },
  { to: '/tools/extract-text', icon: '📝', label: 'Extract Text', color: 'bg-purple' },
  { to: '/tools/word-to-pdf', icon: '📄', label: 'Word to PDF', color: 'bg-indigo' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    historyApi.get()
      .then(res => setHistory(res.data.history || []))
      .catch(() => {})
      .finally(() => setLoadingHistory(false))
  }, [])

  const deleteHistory = async (id) => {
    try {
      await historyApi.delete(id)
      setHistory(h => h.filter(item => item._id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-greeting">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="dashboard-subtitle">Here's an overview of your PDF activity</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {[
            { icon: '📄', value: history.length, label: 'Files Processed' },
            { icon: '💾', value: formatBytes(history.reduce((a, h) => a + (h.outputFile?.size || 0), 0)), label: 'Total Output Size' },
            { icon: '⭐', value: user?.plan?.toUpperCase() || 'FREE', label: 'Current Plan' },
            { icon: '🗂️', value: new Set(history.map(h => h.operation)).size, label: 'Tools Used' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <span className="stat-icon">{s.icon}</span>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Tools */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Quick Access</h2>
          <div className="tools-grid">
            {tools.map(t => (
              <Link key={t.to} to={t.to} className="tool-card">
                <div className={`tool-icon-wrap ${t.color}`}>{t.icon}</div>
                <div className="tool-card-name">{t.label}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* History */}
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Processing History</h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {loadingHistory ? (
              <div className="loading-overlay"><div className="spinner" /><span className="loading-text">Loading history...</span></div>
            ) : history.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <p>No processing history yet. Start using PDF tools!</p>
                <Link to="/tools" className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>Browse Tools</Link>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Operation</th>
                      <th>Input Files</th>
                      <th>Output Size</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(h => (
                      <tr key={h._id}>
                        <td>
                          <span className="badge badge-purple">{getOperationLabel(h.operation)}</span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                          {h.inputFiles?.map(f => f.name).join(', ').substring(0, 40) || 'N/A'}
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{formatBytes(h.outputFile?.size)}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{formatDate(h.createdAt)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {h.outputFile?.url && (
                              <button className="btn btn-primary btn-sm" onClick={() => downloadFile(h.outputFile.url, h.outputFile.name)}>⬇️</button>
                            )}
                            <button className="btn btn-danger btn-sm" onClick={() => deleteHistory(h._id)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
