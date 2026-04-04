import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import DropZone from '../../components/DropZone'
import { pdfApi } from '../../services/api'
import { formatBytes, formatDate } from '../../utils/helpers'

export default function PDFInfo() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState(null)

  const onFiles = useCallback((fs) => {
    const pdf = fs.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf') || f.type.startsWith('image/') || f.name.match(/\.(jpg|jpeg|png)$/i) || f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || f.name.endsWith('.docx'))
    if (!pdf) return toast.error('Please select a valid PDF, Image, or Word file')
    setFile(pdf); setInfo(null)
  }, [])

  const handleAnalyze = async () => {
    if (!file) return toast.error('Please upload a PDF, Image, or Word file')
    setLoading(true)
    try {
      const res = await pdfApi.info(file)
      setInfo(res.data.info)
      toast.success('PDF analyzed successfully!')
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const reset = () => { setFile(null); setInfo(null) }

  const metaRows = info ? [
    { label: 'Filename', value: info.filename },
    { label: 'File Size', value: formatBytes(info.fileSize) },
    { label: 'Total Pages', value: info.pageCount },
    { label: 'Title', value: info.title },
    { label: 'Author', value: info.author },
    { label: 'Subject', value: info.subject },
    { label: 'Creator', value: info.creator },
    { label: 'Created', value: formatDate(info.creationDate) },
  ] : []

  return (
    <div className="tool-page">
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="tool-page-header">
          <span className="badge badge-pink" style={{ marginBottom: 16 }}>📊 Inspect</span>
          <h1>PDF Information</h1>
          <p>View detailed metadata, page dimensions, and document properties of any PDF.</p>
        </div>

        {!info ? (
          <>
            <DropZone onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }} multiple={false}
              label="Click or drag your PDF, Image, or Word here" hint="Upload a PDF, Image, or Word to inspect its metadata"
              files={file ? [file] : []} onRemove={() => { setFile(null); setInfo(null) }} />

            {file && (
              <button onClick={handleAnalyze} disabled={loading}
                className="btn btn-primary btn-lg" style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}>
                {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Analyzing...</> : '🔍 Analyze PDF'}
              </button>
            )}
          </>
        ) : (
          <div className="animate-fade-up">
            {/* Metadata card */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.1rem' }}>📋 Document Metadata</h2>
                <button className="btn btn-ghost btn-sm" onClick={reset}>← Analyze Another</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {metaRows.map(row => (
                    <tr key={row.label} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)', width: '35%' }}>{row.label}</td>
                      <td style={{ padding: '12px 16px', fontSize: 14 }}>{row.value || <span style={{ color: 'var(--text-muted)' }}>N/A</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pages info */}
            {info.pages?.length > 0 && (
              <div className="card">
                <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>📄 Page Details</h2>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                        {['Page', 'Width (pt)', 'Height (pt)', 'Rotation', 'Size'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {info.pages.slice(0, 20).map(p => (
                        <tr key={p.page} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '10px 14px' }}><span className="badge badge-purple" style={{ fontSize: 11 }}>Page {p.page}</span></td>
                          <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{p.width}</td>
                          <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{p.height}</td>
                          <td style={{ padding: '10px 14px', color: p.rotation ? 'var(--accent-orange)' : 'var(--text-secondary)' }}>{p.rotation}°</td>
                          <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                            {p.width > 620 ? 'A4 Landscape' : p.width > 580 ? 'A4 Portrait' : 'Custom'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {info.pages.length > 20 && (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: 12 }}>
                      Showing first 20 of {info.pages.length} pages
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
