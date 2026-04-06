import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import DropZone from '../../components/DropZone'
import ResultPanel from '../../components/ResultPanel'
import { pdfApi } from '../../services/api'
import { formatBytes } from '../../utils/helpers'

export default function WordToPDF() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const onFiles = useCallback((fs) => {
    const docx = fs.find(f => f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || f.name.toLowerCase().endsWith('.docx'))
    if (!docx) return toast.error('Please select a valid Word file (.docx)')
    setFile(docx)
    setResult(null)
  }, [])

  const handleConvert = async () => {
    if (!file) return toast.error('Please upload a Word file')
    setLoading(true); setProgress(0); setResult(null)
    try {
      const res = await pdfApi.wordToPdf(file, e => {
        if (e.total) setProgress(Math.round((e.loaded / e.total) * 100))
      })
      setResult(res.data)
      toast.success('Word document converted to PDF!')
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const reset = () => { setFile(null); setResult(null); setProgress(0) }

  return (
    <div className="tool-page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="tool-page-header">
          <span className="badge badge-purple" style={{ marginBottom: 16 }}>📄 Convert</span>
          <h1>Word to PDF</h1>
          <p>Convert your DOCX files to professional PDF documents while maintaining the original layout.</p>
        </div>

        {result ? (
          <ResultPanel result={result} onReset={reset} />
        ) : (
          <>
            <DropZone onFiles={onFiles} accept={{ 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }} multiple={false}
              label={file ? "Change Word file" : "Click or drag Word file here"} 
              hint="Support DOCX files"
              files={file ? [file] : []} onRemove={() => setFile(null)} />

            {file && (
              <div className="options-panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
                  <span style={{ fontSize: 24 }}>📄</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{file.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Size: {formatBytes(file.size)}</div>
                  </div>
                </div>

                {loading && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
                      <span>Converting to PDF...</span><span>{progress}%</span>
                    </div>
                    <div className="progress-bar-wrap"><div className="progress-bar" style={{ width: `${progress}%` }} /></div>
                  </div>
                )}

                <button onClick={handleConvert} disabled={loading}
                  className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Converting...</> : '🚀 Convert to PDF'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
