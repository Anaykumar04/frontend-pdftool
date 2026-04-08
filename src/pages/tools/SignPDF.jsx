import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import DropZone from '../../components/DropZone'
import ResultPanel from '../../components/ResultPanel'
import { pdfApi } from '../../services/api'

export default function SignPDF() {
  const [file, setFile] = useState(null)
  const [signatureText, setSignatureText] = useState('')
  const [color, setColor] = useState('#000000')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const onFiles = useCallback((fs) => {
    const pdf = fs.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'))
    if (!pdf) return toast.error('Please select a valid PDF file')
    setFile(pdf); setResult(null)
  }, [])

  const handleSign = async () => {
    if (!file) return toast.error('Please upload a PDF file')
    if (!signatureText.trim()) return toast.error('Please enter signature text')
    setLoading(true); setResult(null)
    try {
      // Reusing addStamp API for text signature
      const res = await pdfApi.addStamp(file, signatureText, color)
      setResult(res.data)
      toast.success('PDF signed successfully!')
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const reset = () => { setFile(null); setSignatureText(''); setResult(null) }

  return (
    <div className="tool-page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="tool-page-header">
          <span className="badge badge-teal" style={{ marginBottom: 16 }}>✍️ Security</span>
          <h1>Sign PDF Document</h1>
          <p>Add your electronic signature to any PDF document.</p>
        </div>

        {result ? <ResultPanel result={result} onReset={reset} /> : (
          <>
            <DropZone onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false}
              label="Click or drag your PDF here" hint="Upload a PDF to sign"
              files={file ? [file] : []} onRemove={() => setFile(null)} />

            {file && (
              <div className="options-panel" style={{ marginTop: 24 }}>
                <h3>Signature Settings</h3>

                <div className="options-grid">
                  <div>
                    <label>Signature Text</label>
                    <input type="text" value={signatureText} onChange={e => setSignatureText(e.target.value)}
                      placeholder="Type your name" style={{ fontFamily: 'cursive' }} />
                  </div>
                  <div>
                    <label>Signature Color</label>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <input type="color" value={color} onChange={e => setColor(e.target.value)} />
                      <span>{color}</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 20, padding: 20, background: 'var(--bg-glass)', borderRadius: 8, textAlign: 'center' }}>
                   <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>Preview</p>
                   <div style={{ background: 'white', padding: 20, display: 'inline-block', minWidth: 200, borderRadius: 4 }}>
                      <p style={{ fontFamily: 'cursive', fontSize: 24, color, margin: 0 }}>
                         {signatureText || 'Your Signature'}
                      </p>
                   </div>
                </div>

                <button onClick={handleSign} disabled={loading}
                  className="btn btn-primary btn-lg" style={{ marginTop: 30, width: '100%', justifyContent: 'center' }}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing...</> : '✍️ Sign PDF'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
