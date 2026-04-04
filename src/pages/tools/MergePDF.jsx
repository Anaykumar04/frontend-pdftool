import { useState, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import toast from 'react-hot-toast'
import DropZone from '../../components/DropZone'
import ResultPanel from '../../components/ResultPanel'
import { pdfApi } from '../../services/api'
import { formatBytes } from '../../utils/helpers'

export default function MergePDF() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const addFiles = useCallback((newFiles) => {
    const pdfs = newFiles.filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf') || f.type.startsWith('image/') || f.name.match(/\.(jpg|jpeg|png)$/i) || f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || f.name.endsWith('.docx'))
    if (pdfs.length !== newFiles.length) toast.error('Only PDF, Image, and Word files are accepted')
    setFiles(prev => [...prev, ...pdfs])
  }, [])

  const removeFile = (i) => setFiles(f => f.filter((_, idx) => idx !== i))

  const onDragEnd = ({ source, destination }) => {
    if (!destination) return
    const arr = [...files]
    const [moved] = arr.splice(source.index, 1)
    arr.splice(destination.index, 0, moved)
    setFiles(arr)
  }

  const handleMerge = async () => {
    if (files.length < 2) return toast.error('Please add at least 2 PDF files')
    setLoading(true); setProgress(0); setResult(null)
    try {
      const res = await pdfApi.merge(files, e => {
        if (e.total) setProgress(Math.round((e.loaded / e.total) * 100))
      })
      setResult(res.data)
      toast.success('PDFs merged successfully!')
    } catch (err) {
      toast.error(err.message)
    } finally { setLoading(false) }
  }

  const reset = () => { setFiles([]); setResult(null); setProgress(0) }

  return (
    <div className="tool-page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="tool-page-header">
          <span className="badge badge-purple" style={{ marginBottom: 16 }}>🔗 Organize</span>
          <h1>Merge PDF Files</h1>
          <p>Combine multiple PDF files into one document. Drag to reorder before merging.</p>
        </div>

        {result ? (
          <ResultPanel result={result} onReset={reset} />
        ) : (
          <>
            <DropZone onFiles={addFiles} accept={{ 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }}
              multiple label="Click or drag PDF, Image, or Word files here" hint="Add multiple files (PDF, Image, Word) to merge them into one" files={[]} />

            {files.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                    {files.length} file{files.length !== 1 ? 's' : ''} · Drag to reorder
                  </span>
                  <button className="btn btn-ghost btn-sm" onClick={() => setFiles([])}>Clear All</button>
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="merge-list">
                    {(provided) => (
                      <div className="file-list" ref={provided.innerRef} {...provided.droppableProps}>
                        {files.map((file, i) => (
                          <Draggable key={file.name + i} draggableId={`${file.name}-${i}`} index={i}>
                            {(provided, snapshot) => (
                              <div ref={provided.innerRef} {...provided.draggableProps}
                                className="file-item"
                                style={{ ...provided.draggableProps.style, opacity: snapshot.isDragging ? 0.8 : 1, boxShadow: snapshot.isDragging ? 'var(--shadow-purple)' : 'none' }}>
                                <span {...provided.dragHandleProps} className="drag-handle">⠿</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: 12, minWidth: 20 }}>{i + 1}</span>
                                <span className="file-item-icon">📄</span>
                                <div className="file-item-info">
                                  <div className="file-item-name">{file.name}</div>
                                  <div className="file-item-size">{formatBytes(file.size)}</div>
                                </div>
                                <button className="file-item-remove" onClick={() => removeFile(i)}>✕</button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                {loading && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
                      <span>Uploading & merging...</span><span>{progress}%</span>
                    </div>
                    <div className="progress-bar-wrap"><div className="progress-bar" style={{ width: `${progress}%` }} /></div>
                  </div>
                )}

                <button onClick={handleMerge} disabled={loading || files.length < 2}
                  className="btn btn-primary btn-lg" style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Merging...</> : `🔗 Merge ${files.length} PDFs`}
                </button>
              </div>
            )}

            {files.length === 0 && (
              <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                {['🔒 Secure Upload', '⚡ Instant Merge', '🗑️ Auto-deleted after 1hr'].map(c => (
                  <span key={c} className="chip">{c}</span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
