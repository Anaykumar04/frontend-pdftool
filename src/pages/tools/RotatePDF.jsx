import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import DropZone from '../../components/DropZone'
import ResultPanel from '../../components/ResultPanel'
import { pdfApi } from '../../services/api'

const rotations = [
  { label: '90° Right', value: 90, icon: '↻' },
  { label: '180°', value: 180, icon: '↕' },
  { label: '90° Left', value: 270, icon: '↺' },
]

export default function RotatePDF() {
  const [file, setFile] = useState(null)
  const [rotation, setRotation] = useState(90)
  const [pages, setPages] = useState('all')
  const [customPages, setCustomPages] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const onFiles = useCallback((fs) => {
    const pdf = fs.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf') || f.type.startsWith('image/') || f.name.match(/\.(jpg|jpeg|png)$/i) || f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || f.name.endsWith('.docx'))
    if (!pdf) return toast.error('Please select a valid PDF, Image, or Word file')
    setFile(pdf); setResult(null)
  }, [])

  const handleRotate = async () => {
    if (!file) return toast.error('Please upload a PDF, Image, or Word file')
    setLoading(true); setResult(null)
    try {
      const pageTarget = pages === 'custom' ? customPages : 'all'
      const res = await pdfApi.rotate(file, rotation, pageTarget)
      setResult(res.data)
      toast.success(`PDF rotated ${rotation}° successfully!`)
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const reset = () => { setFile(null); setResult(null) }

  return (
    <div className="tool-page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="tool-page-header">
          <span className="badge badge-blue" style={{ marginBottom: 16 }}>🔄 Optimize</span>
          <h1>Rotate PDF Pages</h1>
          <p>Rotate all pages or specific pages in your PDF to any angle.</p>
        </div>

        {result ? <ResultPanel result={result} onReset={reset} /> : (
          <>
            <DropZone onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }} multiple={false}
              label="Click or drag your PDF, Image, or Word here" hint="Upload a PDF, Image, or Word to rotate its pages"
              files={file ? [file] : []} onRemove={() => setFile(null)} />

            {file && (
              <div className="options-panel" style={{ marginTop: 24 }}>
                <h3>Rotation Options</h3>

                {/* Rotation selector */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ marginBottom: 10 }}>Rotation Angle</label>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {rotations.map(r => (
                      <button key={r.value} onClick={() => setRotation(r.value)}
                        className={`btn ${rotation === r.value ? 'btn-primary' : 'btn-outline'}`}
                        style={{ fontSize: 20, flexDirection: 'column', gap: 4, padding: '14px 24px' }}>
                        <span style={{ fontSize: 28 }}>{r.icon}</span>
                        <span style={{ fontSize: 13 }}>{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pages selector */}
                <div style={{ marginBottom: 8 }}>
                  <label>Pages to Rotate</label>
                  <div className="tabs" style={{ marginBottom: 10 }}>
                    <button className={`tab${pages === 'all' ? ' active' : ''}`} onClick={() => setPages('all')}>All Pages</button>
                    <button className={`tab${pages === 'custom' ? ' active' : ''}`} onClick={() => setPages('custom')}>Custom Pages</button>
                  </div>
                  {pages === 'custom' && (
                    <input type="text" placeholder="e.g. 1, 3, 5-8" value={customPages}
                      onChange={e => setCustomPages(e.target.value)} />
                  )}
                </div>

                <button onClick={handleRotate} disabled={loading}
                  className="btn btn-primary btn-lg" style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Rotating...</> : `🔄 Rotate ${rotation}°`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
