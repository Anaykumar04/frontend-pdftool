import { useState, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import toast from 'react-hot-toast'
import DropZone from '../../components/DropZone'
import ResultPanel from '../../components/ResultPanel'
import { pdfApi } from '../../services/api'

export default function ReorderPDF() {
  const [file, setFile] = useState(null)
  const [pageCount, setPageCount] = useState(0)
  const [pages, setPages] = useState([]) // [{id, label, index}]
  const [loading, setLoading] = useState(false)
  const [infoLoading, setInfoLoading] = useState(false)
  const [result, setResult] = useState(null)

  const onFiles = useCallback(async (fs) => {
    const pdf = fs.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf') || f.type.startsWith('image/') || f.name.match(/\.(jpg|jpeg|png)$/i) || f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || f.name.endsWith('.docx'))
    if (!pdf) return toast.error('Please select a valid PDF, Image, or Word file')
    setFile(pdf); setResult(null); setInfoLoading(true)
    try {
      const res = await pdfApi.info(pdf)
      const count = res.data.info.pageCount
      setPageCount(count)
      setPages(Array.from({ length: count }, (_, i) => ({ id: `page-${i}`, label: `Page ${i + 1}`, index: i })))
    } catch {
      toast.error('Could not read PDF page count')
    } finally { setInfoLoading(false) }
  }, [])

  const onDragEnd = ({ source, destination }) => {
    if (!destination) return
    const arr = [...pages]
    const [moved] = arr.splice(source.index, 1)
    arr.splice(destination.index, 0, moved)
    setPages(arr)
  }

  const handleReorder = async () => {
    if (!file) return toast.error('Please upload a PDF')
    setLoading(true); setResult(null)
    try {
      const order = pages.map(p => p.index)
      const res = await pdfApi.reorder(file, order)
      setResult(res.data)
      toast.success('Pages reordered successfully!')
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const reset = () => { setFile(null); setResult(null); setPages([]); setPageCount(0) }

  const isOriginalOrder = pages.every((p, i) => p.index === i)

  return (
    <div className="tool-page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="tool-page-header">
          <span className="badge badge-purple" style={{ marginBottom: 16 }}>📋 Organize</span>
          <h1>Reorder PDF Pages</h1>
          <p>Drag and drop to rearrange the pages of your PDF in any order.</p>
        </div>

        {result ? <ResultPanel result={result} onReset={reset} /> : (
          <>
            <DropZone onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }} multiple={false}
              label="Click or drag your PDF, Image, or Word here" hint="Upload a PDF, Image, or Word to reorder its pages"
              files={file ? [file] : []} onRemove={reset} />

            {infoLoading && <div className="loading-overlay"><div className="spinner" /><span className="loading-text">Reading PDF pages...</span></div>}

            {pages.length > 0 && !infoLoading && (
              <div style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                    📋 {pageCount} pages · Drag to reorder
                  </span>
                  <button className="btn btn-ghost btn-sm"
                    onClick={() => setPages(pages.slice().sort((a, b) => a.index - b.index))}>
                    Reset Order
                  </button>
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="reorder-list">
                    {(provided) => (
                      <div className="file-list" ref={provided.innerRef} {...provided.droppableProps}>
                        {pages.map((page, i) => (
                          <Draggable key={page.id} draggableId={page.id} index={i}>
                            {(provided, snapshot) => (
                              <div ref={provided.innerRef} {...provided.draggableProps}
                                className="file-item"
                                style={{
                                  ...provided.draggableProps.style,
                                  opacity: snapshot.isDragging ? 0.85 : 1,
                                  boxShadow: snapshot.isDragging ? 'var(--shadow-purple)' : 'none',
                                  borderColor: snapshot.isDragging ? 'var(--accent-purple)' : undefined
                                }}>
                                <span {...provided.dragHandleProps} className="drag-handle">⠿</span>
                                <div style={{
                                  width: 36, height: 36, borderRadius: 8,
                                  background: 'var(--gradient-btn)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0
                                }}>{i + 1}</div>
                                <div className="file-item-info">
                                  <div className="file-item-name">{page.label}</div>
                                  <div className="file-item-size" style={{ color: page.index !== i ? 'var(--accent-purple-light)' : 'var(--text-muted)' }}>
                                    {page.index !== i ? `Moved from position ${page.index + 1}` : 'Original position'}
                                  </div>
                                </div>
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>orig. {page.index + 1}</span>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                {isOriginalOrder && (
                  <div style={{ marginTop: 12, padding: '10px 16px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--accent-orange)' }}>
                    ⚠️ Pages are in original order. Drag to rearrange before saving.
                  </div>
                )}

                <button onClick={handleReorder} disabled={loading}
                  className="btn btn-primary btn-lg" style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Saving...</> : '📋 Save Reordered PDF'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
