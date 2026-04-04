import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
      <div className="animate-fade-up">
        <div style={{ fontSize: 80, marginBottom: 24 }}>📄</div>
        <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: 8 }}>
          <span className="gradient-text">404</span>
        </h1>
        <h2 style={{ fontSize: '1.4rem', marginBottom: 12 }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">🏠 Go Home</Link>
          <Link to="/tools" className="btn btn-outline">🔧 View Tools</Link>
        </div>
      </div>
    </div>
  )
}
