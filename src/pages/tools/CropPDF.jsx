import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import DropZone from '../../components/DropZone'
import ResultPanel from '../../components/ResultPanel'
import { pdfApi } from '../../services/api'
import { formatBytes } from '../../utils/helpers'

export default function CropPDF() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [margins, setMargins] = useState({ top: 0, bottom: 0, left: 0, right: 0 })

  const onFiles = useCallback((fs) => {
    const pdf = fs.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'))
    if (!pdf) return toast.error('Please select a PDF file')
    setFile(pdf); setResult(null)
  }, [])

  const handleCrop = async () => {
    if (!file) return toast.error('Please upload a PDF file')
    const { top, bottom, left, right } = margins
    if (top === 0 && bottom === 0 && left === 0 && right === 0) return toast.error('Please set at least one crop margin')
    setLoading(true); setResult(null)
    try {
      const res = await pdfApi.cropPdf(file, top, bottom, left, right)
      setResult(res.data)
      toast.success(res.data.message)
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const reset = () => { setFile(null); setResult(null); setMargins({ top: 0, bottom: 0, left: 0, right: 0 }) }

  const MarginInput = ({ label, key2 }) => (
    <div style={{ textAlign: 'center' }}>
      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</label>
      <input type="number" min={0} max={200} value={margins[key2]}
        onChange={e => setMargins(m => ({ ...m, [key2]: Number(e.target.value) }))}
        style={{ width: 70, padding: '8px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', textAlign: 'center', outline: 'none' }} />
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>pts</div>
    </div>
  )

  return (
    <div className="tool-page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="tool-page-header">
          <span className="badge badge-cyan" style={{ marginBottom: 16 }}>✂️ Edit</span>
          <h1>Crop PDF</h1>
          <p>Crop the margins of all pages in your PDF. Enter the number of points to remove from each side.</p>
        </div>

        {result ? <ResultPanel result={result} onReset={reset} /> : (
          <>
            <DropZone onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false}
              label={file ? 'Change PDF file' : 'Click or drag PDF here'}
              hint="Upload a PDF to crop its margins"
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

                {/* Crop diagram */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ textAlign: 'center', marginBottom: 12 }}>
                    <MarginInput label="Top" key2="top" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <MarginInput label="Left" key2="left" />
                    <div style={{ width: 120, height: 80, border: '2px dashed var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                      PDF Page
                    </div>
                    <MarginInput label="Right" key2="right" />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <MarginInput label="Bottom" key2="bottom" />
                  </div>
                </div>

                <button onClick={handleCrop} disabled={loading}
                  className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Cropping...</> : '✂️ Crop PDF'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
