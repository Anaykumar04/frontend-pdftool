import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import DropZone from '../../components/DropZone'
import ResultPanel from '../../components/ResultPanel'
import { pdfApi } from '../../services/api'
import { formatBytes } from '../../utils/helpers'

export default function HeaderFooter() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [header, setHeader] = useState('')
  const [footer, setFooter] = useState('Page {page} of {total}')
  const [fontSize, setFontSize] = useState(10)

  const onFiles = useCallback((fs) => {
    const pdf = fs.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'))
    if (!pdf) return toast.error('Please select a PDF file')
    setFile(pdf); setResult(null)
  }, [])

  const handleProcess = async () => {
    if (!file) return toast.error('Please upload a PDF file')
    if (!header && !footer) return toast.error('Please enter at least a header or footer text')
    setLoading(true); setResult(null)
    try {
      const res = await pdfApi.headerFooter(file, header, footer, fontSize)
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
          <span className="badge badge-indigo" style={{ marginBottom: 16 }}>📝 Edit</span>
          <h1>Add Header & Footer</h1>
          <p>Add custom header and footer text to every page. Use <code style={{ background: 'var(--bg-glass)', padding: '2px 6px', borderRadius: 4 }}>{'{page}'}</code> and <code style={{ background: 'var(--bg-glass)', padding: '2px 6px', borderRadius: 4 }}>{'{total}'}</code> for page numbers.</p>
        </div>

        {result ? <ResultPanel result={result} onReset={reset} /> : (
          <>
            <DropZone onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false}
              label={file ? 'Change PDF file' : 'Click or drag PDF here'}
              hint="Upload a PDF to add header/footer"
              files={file ? [file] : []} onRemove={() => setFile(null)} />

            {file && (
              <div className="options-panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
                  <span style={{ fontSize: 24 }}>📄</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{file.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatBytes(file.size)}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Header Text (top center)</label>
                    <input type="text" value={header} onChange={e => setHeader(e.target.value)}
                      placeholder="e.g. My Document — Confidential"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Footer Text (bottom center)</label>
                    <input type="text" value={footer} onChange={e => setFooter(e.target.value)}
                      placeholder="e.g. Page {page} of {total}"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Font Size: {fontSize}pt</label>
                    <input type="range" min={8} max={16} value={fontSize} onChange={e => setFontSize(Number(e.target.value))}
                      style={{ width: '100%' }} />
                  </div>
                </div>

                <button onClick={handleProcess} disabled={loading}
                  className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Processing...</> : '📝 Add Header & Footer'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
