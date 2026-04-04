import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import DropZone from '../../components/DropZone'
import ResultPanel from '../../components/ResultPanel'
import { pdfApi } from '../../services/api'
import { formatBytes } from '../../utils/helpers'

export default function CompressPDF() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const onFiles = useCallback((fs) => {
    const pdf = fs.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf') || f.type.startsWith('image/') || f.name.match(/\.(jpg|jpeg|png)$/i) || f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || f.name.endsWith('.docx'))
    if (!pdf) return toast.error('Please select a valid PDF, Image, or Word file')
    setFile(pdf); setResult(null)
  }, [])

  const handleCompress = async () => {
    if (!file) return toast.error('Please upload a PDF, Image, or Word file')
    setLoading(true); setProgress(0); setResult(null)
    try {
      const res = await pdfApi.compress(file, e => {
        if (e.total) setProgress(Math.round((e.loaded / e.total) * 100))
      })
      setResult(res.data)
      toast.success(`Compressed! Reduced by ${res.data.reduction}%`)
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const reset = () => { setFile(null); setResult(null); setProgress(0) }

  return (
    <div className="tool-page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="tool-page-header">
          <span className="badge badge-green" style={{ marginBottom: 16 }}>📦 Optimize</span>
          <h1>Compress PDF</h1>
          <p>Reduce the size of your PDF file while maintaining document quality.</p>
        </div>

        {result ? (
          <div>
            <ResultPanel result={result} onReset={reset} />
            {/* Compression stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 16 }}>
              {[
                { label: 'Original Size', value: formatBytes(result.originalSize), icon: '📂' },
                { label: 'Compressed Size', value: formatBytes(result.compressedSize), icon: '📦' },
                { label: 'Reduction', value: `${result.reduction}%`, icon: '📉' },
              ].map(s => (
                <div key={s.label} className="card" style={{ textAlign: 'center', padding: 20 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <DropZone onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }} multiple={false}
              label="Click or drag your PDF, Image, or Word here" hint="Upload a PDF file to compress it"
              files={file ? [file] : []} onRemove={() => setFile(null)} />

            {file && (
              <div className="options-panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: 24 }}>📊</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>File ready to compress</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Current size: {formatBytes(file.size)}</div>
                  </div>
                </div>

                {loading && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
                      <span>Compressing PDF...</span><span>{progress}%</span>
                    </div>
                    <div className="progress-bar-wrap"><div className="progress-bar" style={{ width: `${progress}%` }} /></div>
                  </div>
                )}

                <button onClick={handleCompress} disabled={loading}
                  className="btn btn-primary btn-lg" style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Compressing...</> : '📦 Compress PDF'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
