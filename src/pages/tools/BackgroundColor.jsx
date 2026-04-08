import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import DropZone from '../../components/DropZone'
import ResultPanel from '../../components/ResultPanel'
import api from '../../services/api'
import { FiMove } from 'react-icons/fi'

export default function BackgroundColor() {
  const [file, setFile] = useState(null)
  const [color, setColor] = useState('#f0f4f8')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const onFiles = useCallback((fs) => {
    const pdf = fs.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'))
    if (!pdf) return toast.error('Please select a valid PDF file')
    setFile(pdf); setResult(null)
  }, [])

  const handleApply = async () => {
    if (!file) return toast.error('Please upload a PDF file')
    setLoading(true); setResult(null)
    const form = new FormData()
    form.append('file', file)
    form.append('color', color)
    try {
      const res = await api.post('/pdf/background-color', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(res.data)
      toast.success('Background color applied! 🎨')
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const reset = () => { setFile(null); setResult(null) }

  return (
    <div className="tool-page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="tool-page-header">
          <span className="badge badge-pink" style={{ marginBottom: 16 }}>🎨 Styles</span>
          <h1>Change Background Color</h1>
          <p>Instantly change the background color of every page in your PDF document.</p>
        </div>

        {result ? <ResultPanel result={result} onReset={reset} /> : (
          <>
            <DropZone onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false}
              label="Click or drag PDF here" hint="Upload a PDF to change background"
              files={file ? [file] : []} onRemove={() => setFile(null)} />

            {file && (
              <div className="options-panel" style={{ marginTop: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
                    <div>
                        <label>Select Background Color</label>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 10 }}>
                            <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: 60, height: 40 }} />
                            <span style={{ fontWeight: 600 }}>{color}</span>
                        </div>
                    </div>
                    <div style={{ padding: 20, background: 'white', border: `8px solid ${color}`, borderRadius: 8, textAlign: 'center' }}>
                         <p style={{ color: '#888', fontSize: 13, margin: 0 }}>Preview area with <br/> your chosen background</p>
                    </div>
                </div>

                <button onClick={handleApply} disabled={loading}
                  className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 30 }}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Applying...</> : '🎨 Change Background Color'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
