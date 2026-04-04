import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import DropZone from '../../components/DropZone'
import ResultPanel from '../../components/ResultPanel'
import { pdfApi } from '../../services/api'
import { formatBytes } from '../../utils/helpers'

export default function ImageToPDF() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const onFiles = useCallback((fs) => {
    const validFiles = fs.filter(f => f.type.startsWith('image/'))
    if (validFiles.length === 0) return toast.error('Please select valid image files (JPG, PNG)')
    setFiles(prev => [...prev, ...validFiles])
    setResult(null)
  }, [])

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleConvert = async () => {
    if (files.length === 0) return toast.error('Please upload at least one image')
    setLoading(true); setProgress(0); setResult(null)
    try {
      const res = await pdfApi.imageToPdf(files, e => {
        if (e.total) setProgress(Math.round((e.loaded / e.total) * 100))
      })
      setResult(res.data)
      toast.success('Images converted to PDF!')
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const reset = () => { setFiles([]); setResult(null); setProgress(0) }

  return (
    <div className="tool-page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="tool-page-header">
          <span className="badge badge-green" style={{ marginBottom: 16 }}>🖼️ Convert</span>
          <h1>Image to PDF</h1>
          <p>Convert your JPG and PNG images into a professional PDF document in seconds.</p>
        </div>

        {result ? (
          <ResultPanel result={result} onReset={reset} />
        ) : (
          <>
            <DropZone onFiles={onFiles} accept={{ 'image/*': ['.jpg', '.jpeg', '.png'] }} multiple={true}
              label={files.length > 0 ? "Add more images" : "Click or drag images here"} 
              hint="Support JPG, PNG files"
              files={files} onRemove={removeFile} />

            {files.length > 0 && (
              <div className="options-panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
                  <span style={{ fontSize: 24 }}>🖼️</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{files.length} image(s) ready</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Total size: {formatBytes(files.reduce((acc, f) => acc + f.size, 0))}</div>
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
