import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../services/api'

const tools = [
  { to: '/tools/merge',        icon: '🔗', label: 'Merge PDF',       desc: 'Combine multiple PDFs into one',          color: 'bg-purple' },
  { to: '/tools/split',        icon: '✂️', label: 'Split PDF',       desc: 'Extract pages from your PDF',             color: 'bg-blue' },
  { to: '/tools/compress',     icon: '📦', label: 'Compress PDF',    desc: 'Reduce PDF file size',                    color: 'bg-green' },
  { to: '/tools/rotate',       icon: '🔄', label: 'Rotate PDF',      desc: 'Rotate pages to any angle',               color: 'bg-cyan' },
  { to: '/tools/watermark',    icon: '💧', label: 'Watermark PDF',   desc: 'Add custom text watermark',               color: 'bg-orange' },
  { to: '/tools/protect',      icon: '🔒', label: 'Protect PDF',     desc: 'Secure your PDF documents',               color: 'bg-red' },
  { to: '/tools/reorder',      icon: '📋', label: 'Reorder Pages',   desc: 'Drag & drop to rearrange pages',          color: 'bg-indigo' },
  { to: '/tools/delete-page',  icon: '🗑️', label: 'Delete Pages',    desc: 'Remove unwanted pages from PDF',          color: 'bg-red' },
  { to: '/tools/page-number',  icon: '🔢', label: 'Page Numbers',    desc: 'Add page numbers to your PDF',            color: 'bg-cyan' },
  { to: '/tools/jpg-to-pdf',   icon: '🖼️', label: 'JPG to PDF',      desc: 'Convert images to PDF documents',         color: 'bg-teal' },
  { to: '/tools/word-to-pdf',  icon: '📄', label: 'Word to PDF',     desc: 'Convert Word to PDF document',            color: 'bg-indigo' },
  { to: '/tools/extract-text', icon: '📝', label: 'Extract Text',    desc: 'Get searchable text from PDF',            color: 'bg-purple' },
  { to: '/tools/sign',         icon: '✍️', label: 'E-Sign PDF',      desc: 'Sign with typed or drawn signature',      color: 'bg-teal' },
  { to: '/tools/add-stamp',    icon: '💮', label: 'Add Stamp',       desc: 'Apply official rubber stamps',            color: 'bg-purple' },
  { to: '/tools/fillable-pdf', icon: '🔍', label: 'PDF Form Filler', desc: 'AI-scan and fill PDF forms',              color: 'bg-indigo' },
  { to: '/tools/translate-pdf',icon: '🌍', label: 'Translate PDF',   desc: 'Translate PDF to any language',           color: 'bg-blue' },
  { to: '/tools/info',         icon: '📊', label: 'PDF Info',        desc: 'View metadata and page details',          color: 'bg-pink' },
  { to: '/tools/background-color', icon: '🎨', label: 'Background Color', desc: 'Change PDF background color',       color: 'bg-pink' },
]

const features = [
  { icon: '🔐', title: 'Privacy First', desc: 'All files are processed on our secure server and automatically deleted after 1 hour. Your documents stay private.' },
  { icon: '⚡', title: 'Lightning Fast', desc: 'Our optimized processing engine handles your PDFs in seconds, even large files with hundreds of pages.' },
  { icon: '🌐', title: 'Works Anywhere', desc: 'Access from any device, browser, or operating system. No app download required — fully browser-based.' },
  { icon: '🆓', title: 'Always Free', desc: 'All core PDF tools are completely free to use. No hidden fees or limits on basic operations.' },
  { icon: '🛡️', title: 'SSL Encrypted', desc: 'All file transfers use 256-bit SSL encryption so your data is always protected in transit.' },
  { icon: '📱', title: 'Mobile Friendly', desc: 'Fully responsive design works perfectly on smartphones and tablets for PDF editing on the go.' },
]

const faqs = [
  { q: 'Are my uploaded files safe?', a: 'Yes! All uploaded files are processed securely and automatically deleted from our server after 1 hour. We never share your files with third parties.' },
  { q: 'What is the maximum file size?', a: 'You can upload PDF files up to 50MB in size. For merge operations, you can upload up to 20 files at once.' },
  { q: 'Do I need to create an account?', a: 'No account is required to use any PDF tool. Creating a free account lets you access your processing history and manage your files.' },
  { q: 'What PDF operations are supported?', a: 'We support merging, splitting, compressing, rotating, watermarking, protecting, reordering, and converting Word/Images to PDF. More tools are coming soon!' },
  { q: 'Is PDFtoolkit really free?', a: 'Yes! Every PDF tool is completely free to use with no hidden fees, no subscriptions, and no limits. All tools are available to everyone.' },
]

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null)
  const [apiStatus, setApiStatus] = useState('checking')
  const [errorInfo, setErrorInfo] = useState('')

  useEffect(() => {
    // Retry up to 3 times to handle Render free-tier cold start (~30s spin-up)
    let attempts = 0
    const maxAttempts = 3

    const checkHealth = () => {
      attempts++
      api.get('/health')
        .then(() => setApiStatus('ok'))
        .catch(err => {
          if (attempts < maxAttempts) {
            setTimeout(checkHealth, 10000) // retry after 10s
          } else {
            setApiStatus('error')
            setErrorInfo(err.message || 'Network Error')
          }
        })
    }

    checkHealth()
  }, [])

  return (
    <>
      {apiStatus === 'checking' && (
        <div style={{ background: '#fef3c7', color: '#92400e', padding: '12px 20px', textAlign: 'center', borderBottom: '1px solid #fcd34d', zIndex: 1000, position: 'relative' }}>
          ⏳ <strong>Connecting to server…</strong> This may take up to 30 seconds on first load.
        </div>
      )}
      {apiStatus === 'error' && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid #f87171', zIndex: 1000, position: 'relative' }}>
          <strong>⚠️ Server Unavailable:</strong> Could not reach the backend ({errorInfo}). Please refresh the page or try again in a moment.
        </div>
      )}
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-badge animate-fade-up">
            <span className="badge badge-purple">✨ 100% Free · Privacy First · No Registration</span>
          </div>
          <h1 className="hero-title animate-fade-up delay-100">
            The <span className="gradient-text">PDF Toolkit</span>
            <br />built for privacy.
          </h1>
          <p className="hero-subtitle animate-fade-up delay-200">
            Merge, split, compress, rotate, watermark and protect PDFs —
            all in one place. Fast, secure, and always free.
          </p>
          <div className="hero-actions animate-fade-up delay-300">
            <Link to="/tools/merge" className="btn btn-primary btn-lg">🚀 Get Started Free</Link>
            <Link to="/tools" className="btn btn-outline btn-lg">🔧 View All Tools</Link>
          </div>
          <div className="hero-stats animate-fade-up delay-400">
            {[['18+', 'PDF Tools'], ['100%', 'Free Forever'], ['🔒', 'Privacy First']].map(([n, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div className="hero-stat-number gradient-text">{n}</div>
                <div className="hero-stat-label">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GLOW LINE */}
      <div className="glow-line" />

      {/* TOOLS GRID */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-purple" style={{ marginBottom: 16 }}>🔧 All PDF Tools</span>
            <h2>Get Started with <span className="gradient-text">Your Tools</span></h2>
            <p>Professional PDF tools powered by pdf-lib. Fast, private, and incredibly easy to use.</p>
          </div>
          <div className="tools-grid">
            {tools.map((t, i) => (
              <Link key={t.to} to={t.to} className="tool-card animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className={`tool-icon-wrap ${t.color}`}>{t.icon}</div>
                <div className="tool-card-name">{t.label}</div>
                <div className="tool-card-desc">{t.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="section" style={{ background: 'linear-gradient(180deg, var(--bg-primary), var(--bg-secondary))' }}>
        <div className="container">
          <div className="section-header">
            <span className="badge badge-green" style={{ marginBottom: 16 }}>💎 Why Choose Us</span>
            <h2>Why choose <span className="gradient-text">PDFtoolkit?</span></h2>
            <p>Built for people who value speed, security, and simplicity.</p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="section-sm">
        <div className="container">
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)',
            padding: '60px 40px', textAlign: 'center',
            boxShadow: 'var(--shadow-md)'
          }}>
            <h2 style={{ marginBottom: 12 }}>Ready to edit your <span className="gradient-text">PDFs?</span></h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 28, maxWidth: 500, margin: '0 auto 28px' }}>
              Join millions of users who trust PDFtoolkit for their daily PDF needs.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/tools/merge" className="btn btn-primary btn-lg">Start Merging PDFs</Link>
              <Link to="/register" className="btn btn-outline btn-lg">Create Free Account</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-blue" style={{ marginBottom: 16 }}>❓ FAQ</span>
            <h2>Frequently Asked <span className="gradient-text">Questions</span></h2>
          </div>
          <div className="faq-list">
            {faqs.map((f, i) => (
              <div key={i} className={`faq-item${openFaq === i ? ' open' : ''}`}>
                <div className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {f.q}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
                {openFaq === i && <div className="faq-answer">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

