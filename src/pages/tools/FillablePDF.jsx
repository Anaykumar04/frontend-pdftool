import { useState, useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import DropZone from '../../components/DropZone'
import ResultPanel from '../../components/ResultPanel'
import { pdfApi } from '../../services/api'
import { FiCheckSquare, FiDownload, FiEdit3, FiLayout, FiSave, FiSearch, FiCheckCircle } from 'react-icons/fi'

export default function FillablePDF() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [fields, setFields] = useState([])
  const [result, setResult] = useState(null)
  const [step, setStep] = useState(1) // 1: Upload, 2: Detect/Fill
  const [previewUrl, setPreviewUrl] = useState(null)

  const onFiles = useCallback((fs) => {
    const pdf = fs.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'))
    if (!pdf) return toast.error('Please select a valid PDF file')
    setFile(pdf)
    setPreviewUrl(URL.createObjectURL(pdf))
    setResult(null)
    setStep(2)
    handleDetect(pdf)
  }, [])

  const handleDetect = async (f) => {
    setDetecting(true)
    try {
        const res = await pdfApi.detectFields(f)
        // Add a slight delay for the "Scanning" animation to be visible
        setTimeout(() => {
            setFields(res.data.fields)
            setDetecting(false)
            toast.success(res.data.message || 'Fields detected! 🔍')
        }, 3000)
    } catch (err) {
        toast.error('Scan failed: ' + err.message)
        setDetecting(false)
        setStep(1)
    }
  }

  const updateField = (id, val) => {
    setFields(fields.map(f => f.id === id ? { ...f, value: val } : f))
  }

  const handleFill = async () => {
    if (!file) return toast.error('Please upload a PDF file')
    setLoading(true)
    try {
        const res = await pdfApi.fillForm(file, fields)
        setResult({
            name: res.data.output.filename,
            size: res.data.output.size,
            downloadUrl: res.data.output.url
        })
        setLoading(false)
        toast.success('PDF processed successfully! 🚀')
    } catch (err) {
        toast.error(err.message)
        setLoading(false)
    }
  }

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(null); setResult(null); setFields([]); setStep(1); setPreviewUrl(null)
  }

  return (
    <div className="tool-page">
      <div className="container" style={{ maxWidth: 1000 }}>
        <div className="tool-page-header">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="badge badge-indigo" style={{ marginBottom: 16 }}><FiLayout /> Smart Form Processor</span>
            <h1>Real-Time PDF Scanner</h1>
            <p>
              Upload any PDF, and our system will "scan" it in real-time to detect input fields. 
              Fill them out and generate a new version instantly—same layout, perfectly fillable.
            </p>
          </motion.div>
        </div>

        {result ? (
          <ResultPanel result={result} onReset={reset} />
        ) : (
          <div className="workflow">
            {step === 1 ? (
              <DropZone 
                onFiles={onFiles} 
                accept={{ 'application/pdf': ['.pdf'] }} 
                multiple={false}
                label="Click or drag PDF here to SCAN" 
                hint="Supports standard forms, invoices, and applications" 
                files={[]} 
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 24 }}>
                <div className="card-glass" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                         <div className={`status-dot ${detecting ? 'status-pulse' : 'status-active'}`} />
                         <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                            {detecting ? 'Analyzing Structure...' : 'Interactive Form View'}
                         </h3>
                    </div>
                    {!detecting && (
                        <div style={{ display: 'flex', gap: 10 }}>
                             <span className="badge badge-indigo">
                                Live Editor
                             </span>
                             <span className="badge badge-ghost" style={{ fontSize: 10 }}>
                                <FiEdit3 /> Click anyway to add field
                             </span>
                        </div>
                    )}
                  </div>

                  <div className="pdf-editor-canvas-wrapper" style={{ 
                    background: '#1a202c', 
                    borderRadius: 16, 
                    height: 750,
                    position: 'relative',
                    overflow: 'auto',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'inset 0 4px 30px rgba(0,0,0,0.5)',
                    padding: '40px 0',
                    cursor: 'crosshair'
                  }}>
                    <div 
                        id="pdf-render-area"
                        onClick={(e) => {
                            if (detecting || loading) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;
                            const newField = {
                                id: Date.now(),
                                label: `Field ${fields.length + 1}`,
                                name: `custom_${Date.now()}`,
                                value: '',
                                top: `${y - 15}px`, 
                                left: `${x - 10}px`,
                                width: '180px',
                                type: 'text'
                            };
                            setFields([...fields, newField]);
                            toast.success('Field added! 📍');
                        }}
                        style={{ 
                            width: 600, 
                            minHeight: 800, 
                            margin: '0 auto', 
                            background: 'white', 
                            position: 'relative',
                            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                            borderRadius: 4,
                            overflow: 'hidden',
                        }}
                    >
                        {previewUrl && (
                            <iframe 
                                src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
                                style={{ width: '100%', height: 800, border: 'none', pointerEvents: 'none' }}
                                title="PDF Preview"
                            />
                        )}

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

                        {!detecting && fields.map((f, index) => (
                            <motion.div 
                                key={f.id} 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{ 
                                    position: 'absolute', top: f.top, left: f.left,
                                    width: f.width, zIndex: 20
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <input 
                                    type="text"
                                    value={f.value} 
                                    placeholder={f.label}
                                    onChange={e => updateField(f.id, e.target.value)}
                                    style={{ 
                                        width: '100%', padding: '6px 8px', 
                                        border: '1.5px solid rgba(99, 102, 241, 0.4)',
                                        background: f.value ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255, 255, 255, 0.95)',
                                        fontSize: 13, fontWeight: 600, color: '#1a202c',
                                        borderRadius: 4, outline: 'none', transition: 'all 0.2s',
                                        boxShadow: f.value ? '0 0 10px rgba(99, 102, 241, 0.2)' : 'none'
                                    }}
                                />
                                <div style={{ 
                                    position: 'absolute', top: -14, left: 2, fontSize: 9, 
                                    color: 'var(--accent-indigo)', fontWeight: 800, 
                                    background: 'white', padding: '0 4px', borderRadius: 2
                                }}>{f.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    {detecting && (
                        <div style={{ 
                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            textAlign: 'center', zIndex: 30, padding: '30px',
                            background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(15px)',
                            borderRadius: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.4)', border: '1px solid white'
                        }}>
                             <div className="spinner" style={{ margin: '0 auto 16px', width: 40, height: 40, borderTopColor: 'var(--accent-indigo)' }} />
                             <h4 style={{ color: '#1a202c', marginBottom: 4 }}>Scanning AI</h4>
                             <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Identifying input boxes and lines...</p>
                        </div>
                    )}
                  </div>
                </div>

                <div className="sidebar">
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card-glass" 
                    style={{ padding: 24, marginBottom: 16 }}
                  >
                      <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.95rem' }}>
                          <FiEdit3 /> Digital Form Data
                      </h4>
                      
                      <div style={{ display: 'grid', gap: 14, marginBottom: 24, maxHeight: 450, overflowY: 'auto', paddingRight: 4 }}>
                          {fields.length > 0 ? fields.map(f => (
                              <div key={f.id} style={{ position: 'relative' }}>
                                  <label style={{ fontSize: 11, marginBottom: 4, display: 'block' }}>{f.label}</label>
                                  <input 
                                    className="input-glass" 
                                    style={{ padding: '10px 12px', fontSize: 13, borderColor: f.value ? 'rgba(99, 102, 241, 0.5)' : '' }} 
                                    value={f.value}
                                    onChange={e => updateField(f.id, e.target.value)}
                                    placeholder={`Enter ${f.label.toLowerCase()}...`}
                                  />
                                  <button 
                                    onClick={() => setFields(fields.filter(x => x.id !== f.id))}
                                    style={{ position: 'absolute', right: 8, top: 22, border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}
                                  >
                                    ×
                                  </button>
                              </div>
                          )) : (
                              <div style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed var(--border-light)', borderRadius: 12 }}>
                                 <FiLayout style={{ fontSize: 24, opacity: 0.3, marginBottom: 8 }} />
                                 <p style={{ fontSize: 11, color: var(--text-muted) }}>
                                    {detecting ? 'Analyzing document...' : 'No fields detected.\nClick on the document to add one.'}
                                 </p>
                              </div>
                          )}
                      </div>

                      <div style={{ padding: '16px 0', borderTop: '1px solid var(--border-light)', marginTop: 10 }}>
                          <button 
                            onClick={handleFill} 
                            disabled={loading || detecting}
                            className="btn btn-indigo btn-lg" 
                            style={{ width: '100%', justifyContent: 'center', height: 54, borderRadius: 12 }}
                          >
                            {loading ? (
                                <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Processing...</>
                            ) : (
                                <><FiSave /> Process & Download</>
                            )}
                          </button>
                      </div>
                  </motion.div>
                  
                  <div className="card-glass" style={{ padding: 15 }}>
                      <button onClick={reset} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}>
                        Discard & Start New
                      </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
