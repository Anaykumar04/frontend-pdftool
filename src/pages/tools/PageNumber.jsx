import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import DropZone from '../../components/DropZone'
import ResultPanel from '../../components/ResultPanel'
import { pdfApi } from '../../services/api'

export default function PageNumber() {
  const [file, setFile] = useState(null)
  const [position, setPosition] = useState('bottom-center')
  const [fontSize, setFontSize] = useState(12)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const onFiles = useCallback((fs) => {
    const pdf = fs.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'))
    if (!pdf) return toast.error('Please select a valid PDF file')
    setFile(pdf); setResult(null)
  }, [])

  const handleAddNumbers = async () => {
    if (!file) return toast.error('Please upload a PDF file')
    setLoading(true); setResult(null)
    try {
      const res = await pdfApi.pageNumbers(file, position, fontSize)
      setResult(res.data)
      toast.success('Page numbers added successfully!')
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const reset = () => { setFile(null); setResult(null) }

  const positions = [
    { id: 'top-left', label: 'Top Left' },
    { id: 'top-center', label: 'Top Center' },
    { id: 'top-right', label: 'Top Right' },
    { id: 'bottom-left', label: 'Bottom Left' },
    { id: 'bottom-center', label: 'Bottom Center' },
    { id: 'bottom-right', label: 'Bottom Right' },
  ]

  return (
    <div className="tool-page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="tool-page-header">
          <span className="badge badge-cyan" style={{ marginBottom: 16 }}>🔢 Organize</span>
          <h1>Add Page Numbers</h1>
          <p>Add page numbering to your PDF document automatically.</p>
        </div>

        {result ? <ResultPanel result={result} onReset={reset} /> : (
          <>
            <DropZone onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false}
              label="Click or drag your PDF here" hint="Upload a PDF to add page numbers"
              files={file ? [file] : []} onRemove={() => setFile(null)} />

            {file && (
              <div className="options-panel" style={{ marginTop: 24 }}>
                <h3>Number Settings</h3>

                <div className="options-grid">
                  <div>
                    <label>Position</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
                      {positions.map(p => (
                        <button key={p.id} onClick={() => setPosition(p.id)}
                          className={`btn btn-sm ${position === p.id ? 'btn-primary' : 'btn-ghost'}`}>{p.label}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label>Font Size: {fontSize}px</label>
                    <input type="range" min={8} max={24} step={1} value={fontSize}
                      onChange={e => setFontSize(parseInt(e.target.value))} />
                    
                    <div style={{ marginTop: 20 }}>
                       <label>Preview</label>
                       <div style={{ 
                         background: 'white', height: 120, width: 100, margin: '0 auto', 
                         border: '1px solid #ddd', borderRadius: 4, position: 'relative',
                         display: 'flex', flexDirection: 'column', padding: 10
                       }}>
                         <div style={{ background: '#eee', height: 4, width: '80%', marginBottom: 4 }} />
                         <div style={{ background: '#eee', height: 4, width: '100%', marginBottom: 4 }} />
                         <div style={{ background: '#eee', height: 4, width: '60%', marginBottom: 4 }} />
                         
                         {/* Number bubble */}
                         <div style={{
                           position: 'absolute',
                           top: position.includes('top') ? 6 : 'auto',
                           bottom: position.includes('bottom') ? 6 : 'auto',
                           left: position.includes('left') ? 6 : position.includes('right') ? 'auto' : '50%',
                           right: position.includes('right') ? 6 : 'auto',
                           transform: (!position.includes('left') && !position.includes('right')) ? 'translateX(-50%)' : 'none',
                           fontSize: fontSize * 0.4, color: '#666', fontWeight: 600
                         }}>1 / 10</div>
                       </div>
                    </div>
                  </div>
                </div>

                <button onClick={handleAddNumbers} disabled={loading}
                  className="btn btn-primary btn-lg" style={{ marginTop: 30, width: '100%', justifyContent: 'center' }}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Adding Numbers...</> : '🔢 Add Page Numbers'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
