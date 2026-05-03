import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import DropZone from '../../components/DropZone'
import ResultPanel from '../../components/ResultPanel'
import { pdfApi } from '../../services/api'
import { formatBytes } from '../../utils/helpers'

export default function FlattenPDF() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const onFiles = useCallback((fs) => {
    const pdf = fs.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'))
    if (!pdf) return toast.error('Please select a PDF file')
    setFile(pdf); setResult(null)
  }, [])

  const handleFlatten = async () => {
    if (!file) return toast.error('Please upload a PDF file')
    setLoading(true); setResult(null)
    try {
      const res = await pdfApi.flattenPdf(file)
      setResult(res.data)
      toast.success(res.data.message)
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const reset = () => { setFile(null); setResult(null) }

  return (
    <div className="tool-page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="tool-page-header">
          <span className="badge badge-purple" style={{ marginBottom: 16 }}>📋 Edit</span>
          <h1>Flatten PDF</h1>
          <p>Permanently embed all form fields, annotations, and interactive elements into the PDF. Perfect for submitting final documents.</p>
        </div>

        {result ? <ResultPanel result={result} onReset={reset} /> : (
          <>
            <DropZone onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false}
              label={file ? 'Change PDF file' : 'Click or drag PDF here'}
              hint="Upload a PDF with form fields or annotations to flatten"
              files={file ? [file] : []} onRemove={() => setFile(null)} />

            {file && (
              <div className="options-panel">
                <div style={{ padding: '12px 16px', background: 'rgba(245,158,11,0.1)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)', marginBottom: 16, fontSize: 13, color: '#f59e0b' }}>
                  ⚠️ Flattening is permanent — form fields cannot be edited after this operation.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
                  <span style={{ fontSize: 24 }}>📄</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{file.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatBytes(file.size)}</div>
                  </div>
                </div>
                <button onClick={handleFlatten} disabled={loading}
                  className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Flattening...</> : '📋 Flatten PDF'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
