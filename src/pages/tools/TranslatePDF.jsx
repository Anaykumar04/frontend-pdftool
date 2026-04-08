import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import DropZone from '../../components/DropZone'
import ResultPanel from '../../components/ResultPanel'
import api from '../../services/api'
import { FiGlobe } from 'react-icons/fi'

export default function TranslatePDF() {
  const [file, setFile] = useState(null)
  const [targetLang, setTargetLang] = useState('en')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const onFiles = useCallback((fs) => {
    const pdf = fs.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'))
    if (!pdf) return toast.error('Please select a valid PDF file')
    setFile(pdf); setResult(null)
  }, [])

  const handleTranslate = async () => {
    if (!file) return toast.error('Please upload a PDF file')
    setLoading(true); setResult(null)
    const form = new FormData()
    form.append('file', file)
    form.append('to', targetLang)
    try {
      const res = await api.post('/pdf/translate', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(res.data)
      toast.success('Document translated successfully!')
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const reset = () => { setFile(null); setResult(null) }

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'hi', name: 'Hindi' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ar', name: 'Arabic' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'bn', name: 'Bengali' },
  ]

  return (
    <div className="tool-page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="tool-page-header">
          <span className="badge badge-purple" style={{ marginBottom: 16 }}>🌍 Language</span>
          <h1>Translate PDF</h1>
          <p>Translate your PDF document into 100+ languages while maintaining a clean output.</p>
          <div className="card-glass" style={{ padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 12, color: 'var(--accent-purple-light)', border: '1px solid var(--border)' }}>
             <span>💡 Tip: Works best with text-based PDFs. Scanned images require OCR first.</span>
          </div>
        </div>

        {result ? <ResultPanel result={result} onReset={reset} /> : (
          <>
            <DropZone onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false}
              label="Click or drag PDF here" hint="Upload a PDF to translate"
              files={file ? [file] : []} onRemove={() => setFile(null)} />

            {file && (
              <div className="options-panel" style={{ marginTop: 24 }}>
                <div style={{ marginBottom: 20 }}>
                    <label>Target Language</label>
                    <select value={targetLang} onChange={e => setTargetLang(e.target.value)}
                        style={{ width: '100%', marginTop: 8 }}>
                        {languages.map(l => (
                            <option key={l.code} value={l.code}>{l.name}</option>
                        ))}
                    </select>
                </div>

                <button onClick={handleTranslate} disabled={loading}
                  className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Translating...</> : <><FiGlobe /> Translate PDF</>}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
