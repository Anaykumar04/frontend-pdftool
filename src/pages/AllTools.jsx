import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const allTools = [
  {
    category: 'Organize',
    tools: [
      { to: '/tools/merge', icon: '🔗', label: 'Merge PDF', desc: 'Combine multiple PDFs into one file', color: 'bg-purple' },
      { to: '/tools/split', icon: '✂️', label: 'Split PDF', desc: 'Split PDF into individual pages or ranges', color: 'bg-blue' },
      { to: '/tools/reorder', icon: '📋', label: 'Reorder Pages', desc: 'Drag and drop to reorganize pages', color: 'bg-indigo' },
      { to: '/tools/page-number', icon: '🔢', label: 'Page Numbers', desc: 'Add page numbers to your document', color: 'bg-cyan' },
      { to: '/tools/delete-page', icon: '🗑️', label: 'Delete Page', desc: 'Remove unwanted pages from PDF', color: 'bg-red' },
    ]
  },
  {
    category: 'Optimize & Edit',
    tools: [
      { to: '/tools/compress', icon: '📦', label: 'Compress PDF', desc: 'Reduce PDF file size without losing quality', color: 'bg-green' },
      { to: '/tools/rotate', icon: '🔄', label: 'Rotate PDF', desc: 'Rotate all or specific pages', color: 'bg-cyan' },
      { to: '/tools/edit', icon: '✏️', label: 'PDF Editor', desc: 'Edit PDF text and elements online', color: 'bg-purple', isPro: true },
      { to: '/tools/fillable-pdf', icon: '🔍', label: 'PDF Form Scanner', desc: 'Real-time AI scanning to detect and fill form fields', color: 'bg-indigo', isPro: true },
      { to: '/tools/background-color', icon: '🎨', label: 'Background Color', desc: 'Change the background color of pages', color: 'bg-pink' },
    ]
  },
  {
    category: 'Security & Sign',
    tools: [
      { to: '/tools/watermark', icon: '💧', label: 'Watermark PDF', desc: 'Add text watermarks to every page', color: 'bg-orange' },
      { to: '/tools/protect', icon: '🔒', label: 'Protect PDF', desc: 'Secure PDF with protection settings', color: 'bg-red' },
      { to: '/tools/sign', icon: '✍️', label: 'E-Sign PDF', desc: 'Sign with typed, drawn, or image signatures', color: 'bg-teal', isPro: true },
      { to: '/tools/add-stamp', icon: '💮', label: 'Official Stamp', desc: 'Apply specialized office rubber stamps', color: 'bg-purple', isPro: true },
    ]
  },
  {
    category: 'Convert to PDF',
    tools: [
      { to: '/tools/jpg-to-pdf', icon: '🖼️', label: 'JPG to PDF', desc: 'Convert JPG/PNG to PDF file', color: 'bg-teal' },
      { to: '/tools/word-to-pdf', icon: '📄', label: 'Word to PDF', desc: 'Convert Word document to PDF', color: 'bg-indigo' },
      { to: '/tools/csv-to-pdf', icon: '📊', label: 'CSV to PDF', desc: 'Convert CSV data to PDF document', color: 'bg-green' },
      { to: '/tools/json-to-pdf', icon: '📊', label: 'JSON to PDF', desc: 'Convert JSON data into PDF', color: 'bg-purple' },
      { to: '/tools/xml-to-pdf', icon: '📜', label: 'XML to PDF', desc: 'Convert XML structure into PDF', color: 'bg-blue' },
      { to: '/tools/email-to-pdf', icon: '📧', label: 'Email to PDF', desc: 'Save emails as professional PDFs', color: 'bg-orange' },
    ]
  },
  {
    category: 'Convert from PDF',
    tools: [
      { to: '/tools/extract-text', icon: '📝', label: 'Extract Text', desc: 'Convert PDF content to plain text', color: 'bg-purple' },
      { to: '/tools/pdf-to-word', icon: '📘', label: 'PDF to Word', desc: 'Convert PDF to editable Word document', color: 'bg-blue', isPro: true },
      { to: '/tools/ocr', icon: '👁️', label: 'OCR PDF', desc: 'Make scanned PDFs searchable/editable', color: 'bg-pink', isPro: true },
      { to: '/tools/extract-images', icon: '🖼️', label: 'Extract Images', desc: 'Save all images from PDF as a ZIP', color: 'bg-teal' },
      { to: '/tools/translate-pdf', icon: '🌍', label: 'Translate PDF', desc: 'Translate PDF to any language', color: 'bg-indigo', isPro: true },
    ]
  },
]

export default function AllTools() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleToolClick = (e, t) => {
    if (t.isPro && (!user || user.plan === 'free')) {
      e.preventDefault()
      toast.error('This is a PRO tool! Please upgrade your plan.')
      navigate('/pricing')
    }
  }

  return (
    <div className="section">
      <div className="container">
        <div className="section-header">
          <span className="badge badge-purple" style={{ marginBottom: 16 }}>🔧 All Tools</span>
          <h1>All <span className="gradient-text">PDF Tools</span></h1>
          <p>Everything you need to work with PDF files — free, fast, and secure.</p>
        </div>

        {allTools.map((cat) => (
          <div key={cat.category} style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{cat.category}</h2>
              <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
            </div>
            <div className="tools-grid">
              {cat.tools.map((t) => (
                <Link key={t.to} to={t.to} className="tool-card" onClick={(e) => handleToolClick(e, t)}>
                  {t.isPro && (
                    <div style={{ position: 'absolute', top: 12, right: 12, background: 'var(--accent-orange)', color: 'white', padding: '2px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 800, zIndex: 2 }}>PRO</div>
                  )}
                  <div className={`tool-icon-wrap ${t.color}`}>{t.icon}</div>
                  <div className="tool-card-name">{t.label}</div>
                  <div className="tool-card-desc">{t.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Coming Soon */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Coming Soon</h2>
            <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
          </div>
          <div className="tools-grid">
            {['Combine to single page', 'Remove blank page'].map(name => (
              <div key={name} className="tool-card" style={{ opacity: 0.5, cursor: 'default', pointerEvents: 'none' }}>
                <div className="tool-icon-wrap bg-purple" style={{ filter: 'grayscale(1)' }}>🔜</div>
                <div className="tool-card-name">{name}</div>
                <div className="tool-card-desc" style={{ color: 'var(--accent-purple-light)', fontWeight: 600 }}>Coming Soon</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
