import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import DropZone from '../../components/DropZone'
import ResultPanel from '../../components/ResultPanel'
import { pdfApi } from '../../services/api'

export default function WatermarkPDF() {
  const [file, setFile] = useState(null)
  const [text, setText] = useState('CONFIDENTIAL')
  const [opacity, setOpacity] = useState(0.3)
  const [fontSize, setFontSize] = useState(48)
  const [color, setColor] = useState('#FF0000')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const onFiles = useCallback((fs) => {
    const pdf = fs.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf') || f.type.startsWith('image/') || f.name.match(/\.(jpg|jpeg|png)$/i) || f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || f.name.endsWith('.docx'))
    if (!pdf) return toast.error('Please select a valid PDF, Image, or Word file')
    setFile(pdf); setResult(null)
  }, [])

  const handleWatermark = async () => {
    if (!file) return toast.error('Please upload a PDF, Image, or Word file')
    if (!text.trim()) return toast.error('Please enter watermark text')
    setLoading(true); setResult(null)
    try {
      const res = await pdfApi.watermark(file, text, opacity, fontSize, color)
      setResult(res.data)
      toast.success('Watermark added successfully!')
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const reset = () => { setFile(null); setResult(null) }

  const presets = ['CONFIDENTIAL', 'DRAFT', 'DO NOT COPY', 'SAMPLE', 'TOP SECRET']

  return (
    <div className="tool-page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="tool-page-header">
          <span className="badge badge-orange" style={{ marginBottom: 16 }}>💧 Security</span>
          <h1>Add Watermark to PDF</h1>
          <p>Add a custom text watermark across all pages of your PDF document.</p>
        </div>

        {result ? <ResultPanel result={result} onReset={reset} /> : (
          <>
            <DropZone onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }} multiple={false}
              label="Click or drag your PDF, Image, or Word here" hint="Upload a PDF, Image, or Word to add a watermark"
              files={file ? [file] : []} onRemove={() => setFile(null)} />

            {file && (
              <div className="options-panel" style={{ marginTop: 24 }}>
                <h3>Watermark Settings</h3>

                {/* Presets */}
                <div style={{ marginBottom: 16 }}>
                  <label>Quick Presets</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                    {presets.map(p => (
                      <button key={p} onClick={() => setText(p)}
                        className={`btn btn-sm ${text === p ? 'btn-primary' : 'btn-ghost'}`}>{p}</button>
                    ))}
                  </div>
                </div>

                <div className="options-grid">
                  <div>
                    <label>Watermark Text</label>
                    <input type="text" value={text} onChange={e => setText(e.target.value)}
                      placeholder="Enter watermark text" maxLength={50} />
                  </div>
                  <div>
                    <label>Text Color</label>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ flex: 'none' }} />
                      <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{color}</span>
                    </div>
                  </div>
                  <div>
                    <label>Opacity: {Math.round(opacity * 100)}%</label>
                    <input type="range" min={0.05} max={1} step={0.05} value={opacity}
                      onChange={e => setOpacity(parseFloat(e.target.value))} />
                  </div>
                  <div>
                    <label>Font Size: {fontSize}px</label>
                    <input type="range" min={20} max={100} step={4} value={fontSize}
                      onChange={e => setFontSize(parseInt(e.target.value))} />
                  </div>
                </div>

                {/* Preview */}
                <div style={{
                  marginTop: 16, padding: '30px 20px', textAlign: 'center',
                  background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)', overflow: 'hidden', position: 'relative'
                }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 10 }}>Preview</span>
                  <div style={{ background: 'white', padding: '40px 30px', borderRadius: 8, position: 'relative', display: 'inline-block', minWidth: 200 }}>
                    <div style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>Lorem ipsum dolor sit amet...</div>
                    <div style={{ color: '#888', fontSize: 12 }}>PDF document content here</div>
                    {/* Watermark overlay */}
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transform: 'rotate(-45deg)', pointerEvents: 'none'
                    }}>
                      <span style={{
                        color, opacity, fontSize: Math.max(14, fontSize * 0.35),
                        fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: 2
                      }}>{text || 'WATERMARK'}</span>
                    </div>
                  </div>
                </div>

                <button onClick={handleWatermark} disabled={loading}
                  className="btn btn-primary btn-lg" style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Adding Watermark...</> : '💧 Add Watermark'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
