import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import DropZone from '../../components/DropZone'
import ResultPanel from '../../components/ResultPanel'
import api from '../../services/api'

export default function FileConverter({ type, title, icon, colorClass, accept, endpoint }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const onFiles = useCallback((fs) => {
    setFile(fs[0]); setResult(null)
  }, [])

  const handleConvert = async () => {
    if (!file) return toast.error(`Please upload a ${type} file`)
    setLoading(true); setResult(null)
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await api.post(endpoint, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(res.data)
      toast.success(`${type} converted successfully!`)
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const reset = () => { setFile(null); setResult(null) }

  return (
    <div className="tool-page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="tool-page-header">
          <span className={`badge ${colorClass}`} style={{ marginBottom: 16 }}>{icon} Convert</span>
          <h1>{title}</h1>
          <p>Transform your {type} data into a professional, shareable PDF document instantly.</p>
        </div>

        {result ? <ResultPanel result={result} onReset={reset} /> : (
          <>
            <DropZone onFiles={onFiles} accept={accept} multiple={false}
              label={`Click or drag your ${type} here`} hint={`Upload a ${type} to convert to PDF`}
              files={file ? [file] : []} onRemove={() => setFile(null)} />

            {file && (
              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <button onClick={handleConvert} disabled={loading}
                  className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Converting...</> : `${icon} Convert to PDF`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
