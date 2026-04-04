import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import DropZone from '../../components/DropZone'
import ResultPanel from '../../components/ResultPanel'
import { pdfApi } from '../../services/api'

export default function ProtectPDF() {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const onFiles = useCallback((fs) => {
    const pdf = fs.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf') || f.type.startsWith('image/') || f.name.match(/\.(jpg|jpeg|png)$/i) || f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || f.name.endsWith('.docx'))
    if (!pdf) return toast.error('Please select a valid PDF, Image, or Word file')
    setFile(pdf); setResult(null)
    setTitle(pdf.name.replace('.pdf', ''))
  }, [])

  const handleProtect = async () => {
    if (!file) return toast.error('Please upload a PDF, Image, or Word file')
    setLoading(true); setResult(null)
    try {
      const res = await pdfApi.protect(file, title)
      setResult(res.data)
      toast.success('PDF protected successfully!')
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const reset = () => { setFile(null); setResult(null); setTitle('') }

  const features = [
    { icon: '🔒', title: 'Document Lock', desc: 'Marks document as protected with metadata' },
    { icon: '📋', title: 'Custom Title', desc: 'Set a custom title for your document' },
    { icon: '🛡️', title: 'Secure Processing', desc: 'Files processed using encrypted transfer' },
  ]

  return (
    <div className="tool-page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="tool-page-header">
          <span className="badge badge-red" style={{ marginBottom: 16 }}>🔒 Security</span>
          <h1>Protect PDF</h1>
          <p>Secure your PDF documents with protection settings and document metadata.</p>
        </div>

        {result ? <ResultPanel result={result} onReset={reset} /> : (
          <>
            <DropZone onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }} multiple={false}
              label="Click or drag your PDF, Image, or Word here" hint="Upload a PDF, Image, or Word to protect it"
              files={file ? [file] : []} onRemove={() => setFile(null)} />

            {!file && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 24 }}>
                {features.map(f => (
                  <div key={f.title} className="card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                    <h3 style={{ fontSize: '0.95rem', marginBottom: 6 }}>{f.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {file && (
              <div className="options-panel" style={{ marginTop: 24 }}>
                <h3>Protection Settings</h3>
                <div style={{ marginBottom: 16 }}>
                  <label>Document Title</label>
                  <input type="text" value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Enter a title for this document" />
                </div>

                <div style={{ padding: 16, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 14 }}>🔒 What gets protected:</div>
                  <ul style={{ color: 'var(--text-secondary)', fontSize: 13, paddingLeft: 16, lineHeight: 2 }}>
                    <li>Document is marked as protected in metadata</li>
                    <li>Custom title and subject are embedded</li>
                    <li>Document properties are set to read-only</li>
                  </ul>
                </div>

                <button onClick={handleProtect} disabled={loading}
                  className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Protecting...</> : '🔒 Protect PDF'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
