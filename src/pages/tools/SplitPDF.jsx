import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import DropZone from '../../components/DropZone'
import ResultPanel from '../../components/ResultPanel'
import { pdfApi } from '../../services/api'
import { formatBytes } from '../../utils/helpers'

export default function SplitPDF() {
  const [file, setFile] = useState(null)
  const [mode, setMode] = useState('all') // 'all' | 'range'
  const [ranges, setRanges] = useState([{ from: 1, to: 1 }])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const onFiles = useCallback((fs) => {
    const pdf = fs.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf') || f.type.startsWith('image/') || f.name.match(/\.(jpg|jpeg|png)$/i) || f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || f.name.endsWith('.docx'))
    if (!pdf) return toast.error('Please select a valid PDF, Image, or Word file')
    setFile(pdf); setResult(null)
  }, [])

  const addRange = () => setRanges(r => [...r, { from: 1, to: 1 }])
  const updateRange = (i, field, val) => {
    const arr = [...ranges]; arr[i][field] = parseInt(val) || 1; setRanges(arr)
  }
  const removeRange = (i) => setRanges(r => r.filter((_, idx) => idx !== i))

  const handleSplit = async () => {
    if (!file) return toast.error('Please upload a PDF, Image, or Word file')
    setLoading(true); setResult(null)
    try {
      const res = await pdfApi.split(file, mode, mode === 'range' ? ranges : null)
      setResult(res.data)
      toast.success(`PDF split into ${res.data.outputs?.length} parts!`)
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const reset = () => { setFile(null); setResult(null); setRanges([{ from: 1, to: 1 }]) }

  return (
    <div className="tool-page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="tool-page-header">
          <span className="badge badge-blue" style={{ marginBottom: 16 }}>✂️ Organize</span>
          <h1>Split PDF File</h1>
          <p>Extract individual pages or custom page ranges from your PDF document.</p>
        </div>

        {result ? (
          <ResultPanel result={result} onReset={reset}
            extraInfo={`Total pages: ${result.totalPages} · Split into ${result.outputs?.length} part(s)`} />
        ) : (
          <>
            <DropZone onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }} multiple={false}
              label="Click or drag your PDF, Image, or Word here" hint="Upload a single PDF, Image, or Word to split it"
              files={file ? [file] : []} onRemove={() => setFile(null)} />

            {file && (
              <div className="options-panel" style={{ marginTop: 24 }}>
                <h3>Split Options</h3>
                {/* Mode Tabs */}
                <div className="tabs" style={{ marginBottom: 20 }}>
                  <button className={`tab${mode === 'all' ? ' active' : ''}`} onClick={() => setMode('all')}>Extract All Pages</button>
                  <button className={`tab${mode === 'range' ? ' active' : ''}`} onClick={() => setMode('range')}>Custom Ranges</button>
                </div>

                {mode === 'range' && (
                  <div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Define page ranges to extract (e.g., pages 1-3, 5-8):</p>
                    {ranges.map((r, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: 13, minWidth: 60 }}>Range {i + 1}</span>
                        <input type="number" min={1} value={r.from} onChange={e => updateRange(i, 'from', e.target.value)}
                          style={{ width: 80 }} placeholder="From" />
                        <span style={{ color: 'var(--text-muted)' }}>to</span>
                        <input type="number" min={1} value={r.to} onChange={e => updateRange(i, 'to', e.target.value)}
                          style={{ width: 80 }} placeholder="To" />
                        {ranges.length > 1 && <button className="file-item-remove" onClick={() => removeRange(i)}>✕</button>}
                      </div>
                    ))}
                    <button className="btn btn-ghost btn-sm" onClick={addRange} style={{ marginTop: 4 }}>+ Add Range</button>
                  </div>
                )}

                {mode === 'all' && (
                  <div style={{ padding: 16, background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--text-secondary)' }}>
                    📄 Each page will be saved as a separate PDF file. You can download them individually.
                  </div>
                )}

                <button onClick={handleSplit} disabled={loading}
                  className="btn btn-primary btn-lg" style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Splitting...</> : '✂️ Split PDF'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
