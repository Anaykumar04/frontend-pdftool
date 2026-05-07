import { useState, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import api from '../../services/api'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const TOOLS = [
  { id: 'select', icon: '✋', label: 'Select' },
  { id: 'text', icon: 'A|', label: 'Add Text' },
  { id: 'image', icon: '🖼️', label: 'Add Image' },
  { id: 'draw', icon: '✏️', label: 'Draw' },
  { id: 'erase', icon: '🧹', label: 'Erase' },
]

export default function PDFEditor() {
  const [file, setFile] = useState(null)
  const [fileUrl, setFileUrl] = useState(null)
  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [activeTool, setActiveTool] = useState('select')
  const [activeTab, setActiveTab] = useState('edit') // 'annotate' | 'edit'
  const [annotations, setAnnotations] = useState([]) // {type, x, y, text, page, fontSize, color}
  const [editingAnnotation, setEditingAnnotation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const pageRef = useRef(null)
  const inputRef = useRef(null)

  const onFileChange = useCallback((e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.name.endsWith('.pdf') && f.type !== 'application/pdf') {
      toast.error('Please select a PDF file')
      return
    }
    setFile(f)
    setFileUrl(URL.createObjectURL(f))
    setAnnotations([])
    setResult(null)
    setCurrentPage(1)
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) {
      const evt = { target: { files: [f] } }
      onFileChange(evt)
    }
  }, [onFileChange])

  const handlePageClick = (e) => {
    if (activeTool !== 'text') return
    const rect = pageRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    const id = Date.now()
    setAnnotations(prev => [...prev, { id, type: 'text', x, y, text: 'Click to edit', page: currentPage, fontSize: 14, color: '#000000' }])
    setEditingAnnotation(id)
  }

  const updateAnnotation = (id, field, value) => {
    setAnnotations(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a))
  }

  const deleteAnnotation = (id) => {
    setAnnotations(prev => prev.filter(a => a.id !== id))
    setEditingAnnotation(null)
  }

  const handleSave = async () => {
    if (!file) return toast.error('Please upload a PDF file')
    setLoading(true); setResult(null)
    try {
      const form = new FormData()
      form.append('file', file)
      // Convert percentage positions to PDF coordinates (approx 595x842 for A4)
      const edits = annotations.map(a => ({
        text: a.text,
        x: (a.x / 100) * 595,
        y: 842 - (a.y / 100) * 842,
        size: a.fontSize,
        pageIndex: a.page - 1
      }))
      form.append('edits', JSON.stringify(edits))
      const res = await api.post('/pdf/edit-pdf', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(res.data)
      toast.success('PDF saved successfully!')
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const reset = () => {
    setFile(null); setFileUrl(null); setAnnotations([])
    setResult(null); setCurrentPage(1); setScale(1.0)
  }

  const scalePercent = Math.round(scale * 100)

  if (result) {
    return (
      <div className="tool-page">
        <div className="container" style={{ maxWidth: 600 }}>
          <div style={{ ...CARD, padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 className="gradient-text" style={{ marginBottom: 8 }}>PDF Saved!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Your edited PDF is ready to download.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <a href={result.output?.url?.startsWith('http://') ? result.output.url.replace('http://', 'https://') : result.output?.url}
                download target="_blank" rel="noreferrer" className="btn btn-primary btn-lg">
                ⬇️ Download PDF
              </a>
              <button onClick={reset} className="btn btn-outline btn-lg">🔄 Edit Another</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!file) {
    return (
      <div className="tool-page">
        <div className="container" style={{ maxWidth: 600 }}>
          <div className="tool-page-header">
            <span className="badge badge-purple" style={{ marginBottom: 16 }}>✏️ Editor</span>
            <h1>PDF Editor</h1>
            <p>View, annotate and add text to your PDF documents.</p>
          </div>
          <div onDrop={onDrop} onDragOver={e => e.preventDefault()}
            style={{ ...CARD, padding: 60, textAlign: 'center', border: '2px dashed rgba(139,92,246,0.4)', cursor: 'pointer' }}
            onClick={() => document.getElementById('pdf-editor-input').click()}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
            <h3 style={{ marginBottom: 8 }}>Click or drag PDF here</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Upload a PDF to start editing</p>
            <button className="btn btn-primary">Choose PDF File</button>
            <input id="pdf-editor-input" type="file" accept=".pdf,application/pdf" style={{ display: 'none' }} onChange={onFileChange} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', background: '#1a1a2e', overflow: 'hidden' }}>

      {/* Top Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(15,23,42,0.9)', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0, flexWrap: 'wrap' }}>
        {/* Tab buttons */}
        <div style={{ display: 'flex', gap: 4, marginRight: 8 }}>
          {['annotate', 'edit'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, background: activeTab === tab ? '#8b5cf6' : 'rgba(255,255,255,0.08)', color: activeTab === tab ? 'white' : '#94a3b8' }}>
              {tab === 'annotate' ? '✏️ Annotate' : '⚙️ Edit'}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} />

        {/* Tool buttons */}
        {TOOLS.map(t => (
          <button key={t.id} onClick={() => setActiveTool(t.id)} title={t.label}
            style={{ padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '1rem', background: activeTool === t.id ? 'rgba(139,92,246,0.3)' : 'transparent', color: activeTool === t.id ? '#c4b5fd' : '#94a3b8', transition: 'all 0.15s' }}>
            {t.icon}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        {/* Zoom controls */}
        <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} style={ICON_BTN}>−</button>
        <span style={{ color: '#94a3b8', fontSize: '0.85rem', minWidth: 40, textAlign: 'center' }}>{scalePercent}%</span>
        <button onClick={() => setScale(s => Math.min(3, s + 0.1))} style={ICON_BTN}>+</button>

        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} />

        {/* Save button */}
        <button onClick={handleSave} disabled={loading}
          style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: '#8b5cf6', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
          {loading ? '⏳ Saving...' : '💾 Save PDF'}
        </button>
        <button onClick={reset} style={{ ...ICON_BTN, color: '#ef4444' }} title="Close">✕</button>
      </div>

      {/* Main area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left: Page thumbnails */}
        <div style={{ width: 160, background: 'rgba(10,15,30,0.8)', borderRight: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', padding: '12px 8px', flexShrink: 0 }}>
          <Document file={fileUrl} onLoadSuccess={({ numPages: n }) => setNumPages(n)} loading={null} error={null}>
            {Array.from({ length: numPages }, (_, i) => i + 1).map(p => (
              <div key={p} onClick={() => setCurrentPage(p)}
                style={{ marginBottom: 12, cursor: 'pointer', border: currentPage === p ? '2px solid #8b5cf6' : '2px solid transparent', borderRadius: 6, overflow: 'hidden', background: 'white' }}>
                <Page pageNumber={p} width={130} renderTextLayer={false} renderAnnotationLayer={false} loading={null} />
                <div style={{ textAlign: 'center', fontSize: 11, color: currentPage === p ? '#8b5cf6' : '#64748b', padding: '4px 0', background: 'rgba(10,15,30,0.9)' }}>{p}</div>
              </div>
            ))}
          </Document>
        </div>

        {/* Center: PDF viewer */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: 24, background: '#374151' }}>
          <div style={{ position: 'relative', cursor: activeTool === 'text' ? 'crosshair' : 'default', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', display: 'inline-block' }}
            ref={pageRef} onClick={handlePageClick}>
            <Document file={fileUrl} loading={<div style={{ color: 'white', padding: 40 }}>Loading PDF...</div>} error={<div style={{ color: '#ef4444', padding: 40 }}>Failed to load PDF</div>}>
              <Page pageNumber={currentPage} scale={scale} renderTextLayer={true} renderAnnotationLayer={true} />
            </Document>

            {/* Render text annotations on current page */}
            {annotations.filter(a => a.page === currentPage).map(a => (
              <div key={a.id}
                onClick={e => { e.stopPropagation(); setEditingAnnotation(a.id) }}
                style={{ position: 'absolute', left: `${a.x}%`, top: `${a.y}%`, transform: 'translate(-50%, -50%)', cursor: 'move', zIndex: 10 }}>
                {editingAnnotation === a.id ? (
                  <div style={{ background: 'white', border: '2px solid #8b5cf6', borderRadius: 4, padding: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                    <input ref={inputRef} autoFocus value={a.text}
                      onChange={e => updateAnnotation(a.id, 'text', e.target.value)}
                      onBlur={() => setEditingAnnotation(null)}
                      style={{ border: 'none', outline: 'none', fontSize: a.fontSize, color: a.color, minWidth: 80, background: 'transparent' }} />
                    <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                      <input type="number" value={a.fontSize} min={8} max={72}
                        onChange={e => updateAnnotation(a.id, 'fontSize', Number(e.target.value))}
                        style={{ width: 40, fontSize: 11, border: '1px solid #ddd', borderRadius: 3, padding: '1px 4px' }} />
                      <input type="color" value={a.color}
                        onChange={e => updateAnnotation(a.id, 'color', e.target.value)}
                        style={{ width: 24, height: 24, border: 'none', cursor: 'pointer' }} />
                      <button onClick={() => deleteAnnotation(a.id)}
                        style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 3, padding: '1px 6px', cursor: 'pointer', fontSize: 11 }}>✕</button>
                    </div>
                  </div>
                ) : (
                  <span style={{ fontSize: a.fontSize, color: a.color, background: 'rgba(255,255,0,0.3)', padding: '1px 3px', borderRadius: 2, whiteSpace: 'nowrap', userSelect: 'none' }}>
                    {a.text}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Properties panel */}
        <div style={{ width: 220, background: 'rgba(10,15,30,0.8)', borderLeft: '1px solid rgba(255,255,255,0.06)', padding: 16, overflowY: 'auto', flexShrink: 0 }}>
          <h4 style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 600, marginBottom: 16 }}>Properties</h4>

          {activeTool === 'text' && (
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', padding: '12px', background: 'rgba(139,92,246,0.1)', borderRadius: 8, border: '1px solid rgba(139,92,246,0.2)', marginBottom: 16 }}>
              💡 Click anywhere on the PDF to add text
            </div>
          )}

          {editingAnnotation && (() => {
            const a = annotations.find(x => x.id === editingAnnotation)
            if (!a) return null
            return (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: 4 }}>Text</label>
                  <input value={a.text} onChange={e => updateAnnotation(a.id, 'text', e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: 4 }}>Font Size</label>
                  <input type="number" min={8} max={72} value={a.fontSize}
                    onChange={e => updateAnnotation(a.id, 'fontSize', Number(e.target.value))}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: 4 }}>Color</label>
                  <input type="color" value={a.color} onChange={e => updateAnnotation(a.id, 'color', e.target.value)}
                    style={{ width: '100%', height: 32, borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }} />
                </div>
                <button onClick={() => deleteAnnotation(a.id)}
                  style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', cursor: 'pointer', fontSize: '0.8rem' }}>
                  🗑️ Delete
                </button>
              </div>
            )
          })()}

          <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 8 }}>Page Navigation</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1} style={ICON_BTN}>‹</button>
              <span style={{ color: '#e2e8f0', fontSize: '0.85rem', flex: 1, textAlign: 'center' }}>{currentPage} / {numPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))} disabled={currentPage >= numPages} style={ICON_BTN}>›</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom status bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '6px 16px', background: 'rgba(10,15,30,0.9)', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.75rem', color: '#64748b', flexShrink: 0 }}>
        <span>📄 {file?.name}</span>
        <span>Page {currentPage} of {numPages}</span>
        <span>{scalePercent}%</span>
        <span>{annotations.length} annotation{annotations.length !== 1 ? 's' : ''}</span>
        <span style={{ marginLeft: 'auto', color: activeTool === 'text' ? '#a78bfa' : '#64748b' }}>
          Tool: {TOOLS.find(t => t.id === activeTool)?.label}
        </span>
      </div>
    </div>
  )
}

const CARD = {
  background: 'rgba(30,41,59,0.6)',
  backdropFilter: 'blur(16px)',
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.07)',
}

const ICON_BTN = {
  padding: '4px 10px',
  borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.05)',
  color: '#94a3b8',
  cursor: 'pointer',
  fontSize: '0.9rem',
}

