import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import DropZone from '../../components/DropZone'
import ResultPanel from '../../components/ResultPanel'
import api from '../../services/api'
import { FiEdit3, FiPlus, FiTrash2, FiSave } from 'react-icons/fi'

export default function PDFEditor() {
  const [file, setFile] = useState(null)
  const [edits, setEdits] = useState([{ text: '', x: 50, y: 700, size: 14, pageIndex: 0 }])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const onFiles = useCallback((fs) => {
    const pdf = fs.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'))
    if (!pdf) return toast.error('Please select a valid PDF file')
    setFile(pdf); setResult(null)
  }, [])

  const addEdit = () => setEdits([...edits, { text: '', x: 50, y: 500, size: 14, pageIndex: 0 }])
  const removeEdit = (i) => setEdits(edits.filter((_, idx) => idx !== i))
  const updateEdit = (i, field, val) => {
    const newEdits = [...edits]
    newEdits[i][field] = val
    setEdits(newEdits)
  }

  const handleEdit = async () => {
    if (!file) return toast.error('Please upload a PDF file')
    const validEdits = edits.filter(e => e.text.trim() !== '')
    if (validEdits.length === 0) return toast.error('Please add some text to apply')

    setLoading(true); setResult(null)
    const form = new FormData()
    form.append('file', file)
    form.append('edits', JSON.stringify(validEdits))
    try {
      const res = await api.post('/pdf/edit-pdf', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(res.data)
      toast.success('PDF updated successfully!')
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const reset = () => { setFile(null); setResult(null); setEdits([{ text: '', x: 50, y: 700, size: 14, pageIndex: 0 }]) }

  return (
    <div className="tool-page">
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="tool-page-header">
          <span className="badge badge-purple" style={{ marginBottom: 16 }}><FiEdit3 /> Editor</span>
          <h1>PDF Text Editor</h1>
          <p>Add text annotations and simple edits to your PDF document at specific positions.</p>
        </div>

        {result ? <ResultPanel result={result} onReset={reset} /> : (
          <div style={{ display: 'grid', gridTemplateColumns: file ? '1fr 340px' : '1fr', gap: 24 }}>
            <div>
              <DropZone onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false}
                label="Click or drag PDF here" hint="Upload a PDF to edit"
                files={file ? [file] : []} onRemove={() => setFile(null)} />
              
              {file && (
                  <div className="card-glass" style={{ marginTop: 20, padding: 20 }}>
                      <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1.4', background: 'white', borderRadius: 8, overflow: 'hidden', border: '1px solid #ddd' }}>
                          <p style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#ccc', fontSize: 14 }}>PDF Preview Area</p>
                          {edits.map((e, i) => (
                              e.text && (
                                  <div key={i} style={{ 
                                      position: 'absolute', 
                                      left: `${(e.x / 600) * 100}%`, 
                                      bottom: `${(e.y / 800) * 100}%`, 
                                      fontSize: e.size * 0.8, color: 'black', background: 'rgba(255,255,0,0.3)', padding: '2px 4px', pointerEvents: 'none' 
                                  }}>
                                      {e.text}
                                  </div>
                              )
                          ))}
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>Note: Visual coordinates are approximate. PDF uses 72 DPI (0-600 width, 0-800 height avg).</p>
                  </div>
              )}
            </div>

            {file && (
              <div className="sidebar">
                <div className="card-glass" style={{ padding: 20, maxHeight: '60vh', overflowY: 'auto', marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h4 style={{ fontSize: 14 }}>Text Edits</h4>
                        <button onClick={addEdit} className="btn btn-ghost btn-sm"><FiPlus /> Add</button>
                    </div>

                    {edits.map((e, i) => (
                        <div key={i} className="edit-item" style={{ padding: 12, background: 'rgba(0,0,0,0.1)', borderRadius: 8, marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: 11, fontWeight: 600 }}>Text #{i+1}</span>
                                <button onClick={() => removeEdit(i)} style={{ color: 'var(--accent-red)', border: 'none', background: 'transparent', cursor: 'pointer' }}><FiTrash2 size={14} /></button>
                            </div>
                            <input type="text" value={e.text} onChange={u => updateEdit(i, 'text', u.target.value)} placeholder="Text to add" style={{ marginBottom: 10 }} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <div><label style={{ fontSize: 10 }}>X Pos</label><input type="number" value={e.x} onChange={u => updateEdit(i, 'x', u.target.value)} /></div>
                                <div><label style={{ fontSize: 10 }}>Y Pos</label><input type="number" value={e.y} onChange={u => updateEdit(i, 'y', u.target.value)} /></div>
                            </div>
                        </div>
                    ))}
                </div>

                <button onClick={handleEdit} disabled={loading}
                  className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Applying...</> : <><FiSave /> Apply Edits</>}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
