import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import DropZone from '../../components/DropZone'
import ResultPanel from '../../components/ResultPanel'
import api from '../../services/api'
import { FiCheckCircle, FiAlertCircle, FiLock, FiFileText, FiEdit2, FiRotateCw } from 'react-icons/fi'

export default function AddStamp() {
  const [file, setFile] = useState(null)
  const [text, setText] = useState('APPROVED')
  const [variant, setVariant] = useState('rectangular')
  const [color, setColor] = useState('#d32f2f') // Classic Stamp Red
  const [opacity, setOpacity] = useState(0.6)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const onFiles = useCallback((fs) => {
    const pdf = fs.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'))
    if (!pdf) return toast.error('Please select a valid PDF file')
    setFile(pdf); setResult(null)
  }, [])

  const handleStamp = async () => {
    if (!file) return toast.error('Please upload a PDF file')
    setLoading(true); setResult(null)
    const form = new FormData()
    form.append('file', file)
    form.append('text', text.toUpperCase())
    form.append('variant', variant)
    form.append('color', color)
    form.append('opacity', opacity)
    try {
      const res = await api.post('/pdf/add-rubber-stamp', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(res.data)
      toast.success('Professional stamp applied! 💮')
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const reset = () => { setFile(null); setResult(null) }

  const presets = [
    { label: 'Approved', val: 'APPROVED', color: '#2e7d32' },
    { label: 'Urgent', val: 'URGENT', color: '#d32f2f' },
    { label: 'Confidential', val: 'CONFIDENTIAL', color: '#1565c0' },
    { label: 'Draft', val: 'DRAFT', color: '#ff8f00' },
    { label: 'Final', val: 'FINAL', color: '#000000' },
  ]

  return (
    <div className="tool-page">
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="tool-page-header">
          <span className="badge badge-orange" style={{ marginBottom: 16 }}>💮 Official</span>
          <h1>Professional Rubber Stamps</h1>
          <p>Add official office stamps like 'APPROVED', 'FINAL', or 'CONFIDENTIAL' to your PDFs.</p>
        </div>

        {result ? <ResultPanel result={result} onReset={reset} /> : (
          <div style={{ display: 'grid', gridTemplateColumns: file ? '1fr 320px' : '1fr', gap: 24 }}>
            <div>
              <DropZone onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false}
                label="Click or drag PDF here" hint="Upload a PDF to apply a stamp"
                files={file ? [file] : []} onRemove={() => setFile(null)} />

              {file && (
                <div className="card-glass" style={{ marginTop: 20, padding: 30, textAlign: 'center' }}>
                   <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Live Stamp Preview</p>
                   <div style={{ 
                     display: 'inline-block',
                     padding: variant === 'circular' ? '40px' : '15px 30px',
                     border: `4px solid ${color}`,
                     borderRadius: variant === 'circular' ? '50%' : '8px',
                     color: color,
                     opacity: opacity,
                     fontFamily: 'system-ui, sans-serif',
                     fontWeight: 900,
                     fontSize: 32,
                     textTransform: 'uppercase',
                     transform: 'rotate(-15deg)',
                     letterSpacing: 2,
                     pointerEvents: 'none',
                     minWidth: variant === 'circular' ? 180 : 'auto',
                     minHeight: variant === 'circular' ? 180 : 'auto',
                     display: 'inline-flex',
                     alignItems: 'center',
                     justifyContent: 'center'
                   }}>
                     {text || 'PREVIEW'}
                   </div>
                </div>
              )}
            </div>

            {file && (
              <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card-glass" style={{ padding: 20 }}>
                  <h4 style={{ marginBottom: 12, fontSize: 14 }}>Official Presets</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {presets.map(p => (
                      <button key={p.val} onClick={() => { setText(p.val); setColor(p.color) }}
                        className="btn btn-ghost btn-sm" style={{ justifyContent: 'center', fontSize: 11 }}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card-glass" style={{ padding: 20 }}>
                  <h4 style={{ marginBottom: 12, fontSize: 14 }}>Stamp Customization</h4>
                  
                  <div style={{ marginBottom: 16 }}>
                    <label>Stamp Text</label>
                    <input type="text" value={text} onChange={e => setText(e.target.value)} maxLength={15} />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label>Stamp Shape</label>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      <button onClick={() => setVariant('rectangular')} className={`btn btn-sm ${variant === 'rectangular' ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }}>Rect</button>
                      <button onClick={() => setVariant('circular')} className={`btn btn-sm ${variant === 'circular' ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }}>Circle</button>
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label>Color & Opacity</label>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                      <input type="color" value={color} onChange={e => setColor(e.target.value)} />
                      <span style={{ fontSize: 12 }}>{color}</span>
                    </div>
                    <input type="range" min="0.1" max="1" step="0.1" value={opacity} onChange={e => setOpacity(parseFloat(e.target.value))} />
                  </div>
                </div>

                <button onClick={handleStamp} disabled={loading}
                  className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Stamping...</> : '💮 Apply Official Stamp'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
