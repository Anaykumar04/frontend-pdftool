import { Link } from 'react-router-dom'
import { FiClock, FiArrowLeft, FiStar } from 'react-icons/fi'

export default function ComingSoonTool({ name, category }) {
  return (
    <div className="tool-page animate-fade-in">
      <div className="container" style={{ maxWidth: 720, textAlign: 'center' }}>
        <div style={{ marginBottom: 40 }}>
          <Link to="/tools" className="btn btn-ghost btn-sm" style={{ marginBottom: 24 }}>
            <FiArrowLeft /> Back to All Tools
          </Link>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div className="tool-icon-wrap bg-purple" style={{ width: 80, height: 80, fontSize: 40 }}>
              <FiStar />
            </div>
          </div>
          <span className="badge badge-purple" style={{ marginBottom: 16 }}>{category || 'New Tool'}</span>
          <h1 style={{ fontSize: '2.5rem', marginBottom: 16 }}>{name} is <span className="gradient-text">Coming Soon</span></h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: 500, margin: '0 auto' }}>
            We're putting the finishing touches on this powerful tool. It will be available for all users shortly!
          </p>
        </div>

        <div className="card-glass" style={{ padding: 40, border: '1px dashed var(--border)' }}>
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 48 }}>⚡</span>
            <h3 style={{ marginTop: 12 }}>Stay Tuned</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
              Check back in a few days or follow us for updates.
            </p>
          </div>
          <Link to="/tools" className="btn btn-primary">
            Explore Existing Tools
          </Link>
        </div>

        <div style={{ marginTop: 60, display: 'flex', gap: 40, justifyContent: 'center' }}>
          {[
            { icon: <FiClock />, label: '95% Complete' },
            { icon: <FiStar />, label: 'Premium Quality' }
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--accent-purple-light)' }}>{item.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
