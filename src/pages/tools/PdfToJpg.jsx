import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import DropZone from '../../components/DropZone'
import { pdfApi } from '../../services/api'
import { formatBytes } from '../../utils/helpers'

export default function PdfToJpg() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [outputs, setOutputs] = useState([])

  const onFiles = useCallback((fs) => {
    const pdf = fs.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'))
    if (!pdf) return toast.error('Please select a PDF file')
    setFile(pdf); setOutputs([])
  }, [])

  const handleConvert = async () => {
    if (!file) return toast.error('Please upload a PDF file')
    setLoading(true); setProgress(0); setOutputs([])
    try {
      const res = await pdfApi.pdfToJpg(file, e => {
        if (e.total) setProgress(Math.round((e.loaded / e.total) * 100))
      })
      setOutputs(res.data.outputs || [])
      toast.success(res.data.message)
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const reset = () => { setFile(null); setOutputs([]); setProgress(0) }

  return (
    <div className="tool-page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="tool-page-header">
          <span className="badge badge-blue" style={{ marginBottom: 16 }}>📸 Convert</span>
          <h1>PDF to JPG</h1>
          <p>Convert each page of your PDF into a high-quality JPG image.</p>
        </div>

        {outputs.length > 0 ? (
          <div className="options-panel">
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
              <h3 className="gradient-text">Conversion Complete!</h3>
              <p style={{ color: 'var(--text-secondary)' }}>{outputs.length} page(s) converted</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
              {outputs.map((o, i) => (
                <a key={i} href={o.url?.startsWith('http://') ? o.url.replace('http://', 'https://') : o.url}
                  download target="_blank" rel="noreferrer"
                  className="btn btn-outline btn-sm" style={{ justifyContent: 'center' }}>
                  📸 Page {o.page}
                </a>
              ))}
            </div>
            <button onClick={reset} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
              🔄 Convert Another PDF
            </button>
          </div>
        ) : (
          <>
            <DropZone onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false}
              label={file ? 'Change PDF file' : 'Click or drag PDF here'}
              hint="Upload a PDF to convert pages to JPG"
              files={file ? [file] : []} onRemove={() => setFile(null)} />

            {file && (
              <div className="options-panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
                  <span style={{ fontSize: 24 }}>📄</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{file.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatBytes(file.size)}</div>
                  </div>
                </div>
                {loading && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
                      <span>Converting pages...</span><span>{progress}%</span>
                    </div>
                    <div className="progress-bar-wrap"><div className="progress-bar" style={{ width: `${progress}%` }} /></div>
                  </div>
                )}
                <button onClick={handleConvert} disabled={loading}
                  className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Converting...</> : '📸 Convert to JPG'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
