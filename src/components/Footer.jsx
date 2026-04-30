import { Link } from 'react-router-dom'
import { FiTwitter, FiGithub, FiLinkedin } from 'react-icons/fi'

const toolLinks = [
  { to: '/tools/merge', label: 'Merge PDF' },
  { to: '/tools/split', label: 'Split PDF' },
  { to: '/tools/compress', label: 'Compress PDF' },
  { to: '/tools/rotate', label: 'Rotate PDF' },
  { to: '/tools/watermark', label: 'Watermark PDF' },
  { to: '/tools/protect', label: 'Protect PDF' },
  { to: '/tools/reorder', label: 'Reorder Pages' },
  { to: '/tools/info', label: 'PDF Info' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ background: 'var(--gradient-btn)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📄</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem' }}>PDFtoolkit</span>
            </div>
            <p>The ultimate privacy-first PDF toolkit. All processing happens on our secure server. Your files are automatically deleted after 1 hour.</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              {[FiTwitter, FiGithub, FiLinkedin].map((Icon, i) => (
                <a key={i} href="#" aria-label="social"
                  style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-glass)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--navbar-light)'; e.currentTarget.style.color = 'var(--navbar-light)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div className="footer-col">
            <h4>PDF Tools</h4>
            <div className="footer-links">
              {toolLinks.slice(0, 4).map(l => <Link key={l.to} to={l.to}>{l.label}</Link>)}
            </div>
          </div>

          <div className="footer-col">
            <h4>More Tools</h4>
            <div className="footer-links">
              {toolLinks.slice(4).map(l => <Link key={l.to} to={l.to}>{l.label}</Link>)}
              <Link to="/tools">All Tools →</Link>
            </div>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <div className="footer-links">
              <a href="#">About Us</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Contact</a>
              <Link to="/register">Sign Up Free</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 PDFtoolkit. All rights reserved. Built with ❤️ using MERN Stack.</p>
          <div style={{ display: 'flex', gap: 16 }}>
            <span className="chip">🔒 SSL Encrypted</span>
            <span className="chip">🗑️ Auto-Delete Files</span>
            <span className="chip">⚡ Fast Processing</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
