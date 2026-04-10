import { useState, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

import DropZone from '../../components/DropZone'
import ResultPanel from '../../components/ResultPanel'
import { pdfApi } from '../../services/api'
import { FiLayout, FiSearch, FiCheckCircle, FiEdit3, FiMousePointer, FiSave, FiTrash2 } from 'react-icons/fi'

// Initialize pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function FillablePDF() {
  const [file, setFile] = useState(null)
  const [fileUrl, setFileUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [fields, setFields] = useState([])
  const [result, setResult] = useState(null)
  const [step, setStep] = useState(1) // 1: Upload, 2: Interactive Scanner

  const pageRef = useRef(null)

  const onFiles = useCallback((fs) => {
    const pdf = fs.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'))
    if (!pdf) return toast.error('Please select a valid PDF file')
    setFile(pdf)
    setFileUrl(URL.createObjectURL(pdf))
    setResult(null)
    setStep(2)
    startSimulatedScan()
  }, [])

  const startSimulatedScan = () => {
    setDetecting(true)
    setTimeout(() => {
        setDetecting(false)
        toast.success('Document loaded! Click anywhere to type. 🖱️')
    }, 2000)
  }

  const handlePageClick = (e) => {
    if (detecting || loading) return
    const rect = pageRef.current.getBoundingClientRect()
    // Calculate percentage based offsets for responsiveness and backend accuracy
    const xPct = (e.clientX - rect.left) / rect.width
    const yPct = (e.clientY - rect.top) / rect.height
    
    const newField = {
        id: Date.now(),
        label: `Field ${fields.length + 1}`,
        name: `custom_${Date.now()}`,
        value: '',
        xPct,
        yPct,
        // Approximate width for the input box
        width: 150
    }
    setFields([...fields, newField])
  }

  const updateField = (id, val) => {
    setFields(fields.map(f => f.id === id ? { ...f, value: val } : f))
  }

  const handleProcess = async () => {
    if (!file) return toast.error('Please upload a PDF file')
    if (fields.length === 0) return toast.error('Please add at least one field')
    setLoading(true)
    try {
        const res = await pdfApi.fillForm(file, fields)
        setResult({
            output: res.data.output,
            message: res.data.message
        })
        toast.success('Form filled and ready! 🚀')
    } catch (err) {
        toast.error('Failed to process: ' + err.message)
    } finally {
        setLoading(false)
    }
  }

  const reset = () => {
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    setFile(null); setFileUrl(null); setResult(null); setStep(1); setFields([])
  }

  return (
    <div className="tool-page">
      <div className="container" style={{ maxWidth: 1200 }}>
        <div className="tool-page-header">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="badge badge-indigo" style={{ marginBottom: 16 }}><FiLayout /> Image & Scanned Form Processor</span>
            <h1>Real-Time PDF Form Filler</h1>
            <p>
              Upload any PDF (even scanned paper photos!). Click anywhere on the document to add digital text, 
              and we will permanently <strong>burn</strong> it into a high-quality PDF replica.
            </p>
          </motion.div>
        </div>

        <div className="workflow">
          {step === 1 ? (
            <DropZone 
              onFiles={onFiles} 
              accept={{ 'application/pdf': ['.pdf'] }} 
              multiple={false}
              label="Click or drag scanned PDF here" 
              hint="Perfect for scanned bank forms, invoices, and physical documents" 
              files={[]} 
            />
          ) : result ? (
             <ResultPanel result={result} onReset={reset} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 24, alignItems: 'start' }}>
              <div className="card-glass" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                       <div className={`status-dot ${detecting ? 'status-pulse' : 'status-active'}`} />
                       <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                          {detecting ? 'Analyzing Structure...' : 'Document View'}
                       </h3>
                  </div>
                  {!detecting && (
                      <span className="badge badge-ghost" style={{ fontSize: 11 }}>
                          <FiMousePointer /> Click on lines to type
                      </span>
                  )}
                </div>

                <div style={{ 
                  background: '#1a202c', 
                  borderRadius: 16, 
                  height: 750,
                  position: 'relative',
                  overflow: 'auto',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'inset 0 4px 30px rgba(0,0,0,0.5)',
                  padding: '20px',
                }}>
                    <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto' }}>
                        {fileUrl && (
                            <Document 
                                file={fileUrl} 
                                loading={<div className="spinner" style={{ margin: '40px auto', width: 40, height: 40, borderTopColor: 'var(--accent-indigo)' }} />}
                            >
                                <div 
                                    ref={pageRef}
                                    onClick={handlePageClick} 
                                    style={{ 
                                        position: 'relative', 
                                        boxShadow: '0 25px 60px rgba(0,0,0,0.6)', 
                                        borderRadius: 4, 
                                        overflow: 'hidden',
                                        cursor: 'text'
                                    }}
                                >
                                    <Page 
                                        pageNumber={1} 
                                        width={600} 
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                    />

                                    {/* Scanning Overlay */}
                                    <AnimatePresence>
                                        {detecting && (
                                            <motion.div 
                                                initial={{ top: 0 }}
                                                animate={{ top: '100%' }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                style={{ 
                                                    position: 'absolute', left: 0, right: 0, height: 3, 
                                                    background: 'linear-gradient(to right, transparent, var(--accent-indigo), transparent)',
                                                    boxShadow: '0 0 20px var(--accent-indigo)', zIndex: 10
                                                }}
                                            />
                                        )}
                                    </AnimatePresence>

                                    {/* Render Fields perfectly relative to the dimensions */}
                                    {!detecting && fields.map((f) => (
                                        <div 
                                            key={f.id} 
                                            style={{ 
                                                // Adjust visual offset so input centers roughly on the click
                                                position: 'absolute', 
                                                top: `calc(${f.yPct * 100}% - 14px)`, 
                                                left: `calc(${f.xPct * 100}% - 4px)`,
                                                width: f.width, 
                                                zIndex: 20
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <input 
                                                type="text"
                                                value={f.value} 
                                                placeholder={f.label}
                                                autoFocus
                                                onChange={e => updateField(f.id, e.target.value)}
                                                style={{ 
                                                    width: '100%', padding: '4px 8px', 
                                                    border: '1.5px solid rgba(99, 102, 241, 0.6)',
                                                    background: f.value ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255, 255, 255, 0.95)',
                                                    fontSize: 13, fontWeight: 500, color: '#1a202c',
                                                    borderRadius: 4, outline: 'none', transition: 'all 0.2s',
                                                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                            <button 
                                                onClick={() => setFields(fields.filter(x => x.id !== f.id))}
                                                style={{ position: 'absolute', right: -24, top: 4, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 10 }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </Document>
                        )}
                    </div>
                </div>
              </div>

              <div className="sidebar" style={{ position: 'sticky', top: 80 }}>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card-glass" style={{ padding: 24, marginBottom: 16 }}>
                    <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.95rem' }}>
                        <FiEdit3 /> Data Points ({fields.length})
                    </h4>
                    
                    <div style={{ display: 'grid', gap: 14, marginBottom: 24, maxHeight: 400, overflowY: 'auto', paddingRight: 4 }}>
                        {fields.length > 0 ? fields.map((f, i) => (
                            <div key={f.id} style={{ position: 'relative' }}>
                                <label style={{ fontSize: 11, marginBottom: 4, display: 'block', color: 'var(--text-secondary)' }}>Item {i + 1}</label>
                                <input 
                                  className="input-glass" 
                                  style={{ padding: '8px 12px', fontSize: 13, borderColor: f.value ? 'rgba(99, 102, 241, 0.5)' : '' }} 
                                  value={f.value}
                                  onChange={e => updateField(f.id, e.target.value)}
                                  placeholder={`Type here...`}
                                />
                                <button onClick={() => setFields(fields.filter(x => x.id !== f.id))} style={{ position: 'absolute', right: 8, top: 20, border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>
                                  ×
                                </button>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed var(--border-light)', borderRadius: 12 }}>
                               <FiMousePointer style={{ fontSize: 24, opacity: 0.3, marginBottom: 8 }} />
                               <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                  {detecting ? 'Analyzing...' : 'Click anywhere on the PDF to type'}
                               </p>
                            </div>
                        )}
                    </div>

                    <div style={{ padding: '16px 0', borderTop: '1px solid var(--border-light)', marginTop: 10 }}>
                        <button onClick={handleProcess} disabled={loading || detecting || fields.length === 0} className="btn btn-indigo btn-lg" style={{ width: '100%', justifyContent: 'center', height: 54, borderRadius: 12 }}>
                          {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Processing...</> : <><FiSave /> Burn & Download</>}
                        </button>
                    </div>
                </motion.div>
                
                <div className="card-glass" style={{ padding: 15 }}>
                    <button onClick={reset} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}>
                      Discard Document
                    </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
