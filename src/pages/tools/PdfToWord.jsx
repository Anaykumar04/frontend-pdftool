import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import DropZone from '../../components/DropZone'
import ResultPanel from '../../components/ResultPanel'
import { pdfApi } from '../../services/api'
import { formatBytes } from '../../utils/helpers'

export default function PdfToWord() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const onFiles = useCallback((fs) => {
    const pdf = fs.find(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))
    if (!pdf) return toast.error('Please select a valid PDF file (.pdf)')
    setFile(pdf)
    setResult(null)
  }, [])

  const handleConvert = async () => {
    if (!file) return toast.error('Please upload a PDF file')
    setLoading(true); setProgress(0); setResult(null)
    try {
      const res = await pdfApi.pdfToWord(file, e => {
        if (e.total) setProgress(Math.round((e.loaded / e.total) * 100))
      })
      setResult(res.data)
      toast.success('PDF converted to Word!')
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const reset = () => { setFile(null); setResult(null); setProgress(0) }

  return (
    <div className="tool-page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="tool-page-header">
          <span className="badge badge-blue" style={{ marginBottom: 16 }}>📘 Convert</span>
          <h1>PDF to Word</h1>
          <p>Convert your PDF documents into editable Word (.docx) files. Text content and page structure are preserved.</p>
        </div>

        {result ? (
          <ResultPanel result={result} onReset={reset} extraInfo="Your Word document is ready to download and edit." />
        ) : (
          <>
            <DropZone
              onFiles={onFiles}
              accept={{ 'application/pdf': ['.pdf'] }}
              multiple={false}
              label={file ? 'Change PDF file' : 'Click or drag PDF here'}
              hint="Upload a PDF to convert to Word (.docx)"
              files={file ? [file] : []}
              onRemove={() => setFile(null)}
            />

            {file && (
              <div className="options-panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
                  <span style={{ fontSize: 24 }}>📄</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{file.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Size: {formatBytes(file.size)}</div>
                  </div>
                </div>

                <div style={{ padding: '10px 14px', background: 'rgba(59,130,246,0.08)', borderRadius: 8, border: '1px solid rgba(59,130,246,0.2)', marginBottom: 16, fontSize: 13, color: '#93c5fd' }}>
                  ℹ️ Text-based PDFs convert best. Scanned/image PDFs may have limited text extraction.
                </div>

                {loading && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
                      <span>Converting to Word...</span><span>{progress}%</span>
                    </div>
                    <div className="progress-bar-wrap">
                      <div className="progress-bar" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleConvert}
                  disabled={loading}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {loading
                    ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Converting...</>
                    : '📘 Convert to Word'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

