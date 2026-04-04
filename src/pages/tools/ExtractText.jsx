import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import DropZone from '../../components/DropZone'
import ResultPanel from '../../components/ResultPanel'
import { pdfApi } from '../../services/api'

export default function ExtractText() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const onFiles = useCallback((fs) => {
    const pdf = fs.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf') || f.type.startsWith('image/') || f.name.match(/\.(jpg|jpeg|png)$/i) || f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || f.name.endsWith('.docx'))
    if (!pdf) return toast.error('Please select a valid PDF, Image, or Word file')
    setFile(pdf); setResult(null)
  }, [])

  const handleExtract = async () => {
    if (!file) return toast.error('Please upload a PDF, Image, or Word file')
    setLoading(true); setProgress(0); setResult(null)
    try {
      const res = await pdfApi.extractText(file, e => {
        if (e.total) setProgress(Math.round((e.loaded / e.total) * 100))
      })
      setResult(res.data)
      toast.success('Text extracted successfully!')
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const reset = () => { setFile(null); setResult(null); setProgress(0) }

  return (
    <div className="tool-page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="tool-page-header">
          <span className="badge badge-purple" style={{ marginBottom: 16 }}>📝 Content</span>
          <h1>Extract Text</h1>
          <p>Extract searchable text from your PDF document and save it as a TXT file.</p>
        </div>

        {result ? (
          <div>
            <ResultPanel result={result} onReset={reset} />
            {result.text && (
              <div className="card" style={{ marginTop: 20, textAlign: 'left' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: 12 }}>Preview (First 1000 characters)</h3>
                <div style={{ 
                  background: 'var(--bg-glass)', padding: 16, borderRadius: 'var(--radius-md)', 
                  maxHeight: 300, overflowY: 'auto', fontSize: 13, color: 'var(--text-secondary)',
                  whiteSpace: 'pre-wrap', fontFamily: 'monospace' 
                }}>
                  {result.text.substring(0, 1000)}
                  {result.text.length > 1000 && '...'}
                </div>
                <button className="btn btn-outline btn-sm" style={{ marginTop: 16 }}
                  onClick={() => {
                    const blob = new Blob([result.text], { type: 'text/plain' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `extracted_text_${Date.now()}.txt`;
                    a.click();
                  }}>
                  💾 Download Full Text
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <DropZone onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }} multiple={false}
              label="Click or drag your PDF, Image, or Word here" hint="Upload a PDF, Image, or Word to extract its text"
              files={file ? [file] : []} onRemove={() => setFile(null)} />

            {file && (
              <div className="options-panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
                  <span style={{ fontSize: 24 }}>📝</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>File ready for extraction</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{file.name}</div>
                  </div>
                </div>

                {loading && (
                   <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
                      <span>Extracting text...</span><span>{progress}%</span>
                    </div>
                    <div className="progress-bar-wrap"><div className="progress-bar" style={{ width: `${progress}%` }} /></div>
                  </div>
                )}

                <button onClick={handleExtract} disabled={loading}
                  className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Extracting...</> : '📝 Extract Text'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
