import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import DropZone from '../../components/DropZone'
import ResultPanel from '../../components/ResultPanel'
import { pdfApi } from '../../services/api'

export default function DeletePage() {
  const [file, setFile] = useState(null)
  const [pagesToDelete, setPagesToDelete] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const onFiles = useCallback((fs) => {
    const pdf = fs.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'))
    if (!pdf) return toast.error('Please select a valid PDF file')
    setFile(pdf); setResult(null)
  }, [])

  const handleDelete = async () => {
    if (!file) return toast.error('Please upload a PDF file')
    if (!pagesToDelete.trim()) return toast.error('Please enter pages to delete')
    
    // Parse pages like "1, 2, 5-8"
    const pages = []
    const parts = pagesToDelete.split(',')
    for (let part of parts) {
      part = part.trim()
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()))
        if (start && end) {
          for (let i = start; i <= end; i++) pages.push(i)
        }
      } else {
        const n = parseInt(part)
        if (n) pages.push(n)
      }
    }

    if (pages.length === 0) return toast.error('Invalid page format')

    setLoading(true); setResult(null)
    try {
      const res = await pdfApi.deletePages(file, [...new Set(pages)])
      setResult(res.data)
      toast.success('Pages deleted successfully!')
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const reset = () => { setFile(null); setPagesToDelete(''); setResult(null) }

  return (
    <div className="tool-page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="tool-page-header">
          <span className="badge badge-red" style={{ marginBottom: 16 }}>✂️ Organize</span>
          <h1>Delete PDF Pages</h1>
          <p>Remove unwanted pages from your PDF document easily.</p>
        </div>

        {result ? <ResultPanel result={result} onReset={reset} /> : (
          <>
            <DropZone onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false}
              label="Click or drag your PDF here" hint="Upload a PDF to remove pages"
              files={file ? [file] : []} onRemove={() => setFile(null)} />

            {file && (
              <div className="options-panel" style={{ marginTop: 24 }}>
                <h3>Delete Settings</h3>

                <div className="options-grid">
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label>Pages to Delete (e.g. 1, 3, 5-8)</label>
                    <input type="text" value={pagesToDelete} onChange={e => setPagesToDelete(e.target.value)}
                      placeholder="Enter page numbers separated by commas or ranges" />
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                      Use commas for individual pages and dashes for ranges.
                    </p>
                  </div>
                </div>

                <button onClick={handleDelete} disabled={loading}
                  className="btn btn-primary btn-lg" style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Deleting Pages...</> : '🗑️ Delete Pages'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
