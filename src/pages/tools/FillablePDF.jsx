import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import DropZone from '../../components/DropZone'
import ResultPanel from '../../components/ResultPanel'
import { pdfApi } from '../../services/api'
import { FiLayout, FiSearch, FiCheckCircle } from 'react-icons/fi'

export default function FillablePDF() {
  const [file, setFile] = useState(null)
  const [detecting, setDetecting] = useState(false)
  const [result, setResult] = useState(null)
  const [step, setStep] = useState(1) // 1: Upload, 2: Scanning & Result

  const onFiles = useCallback((fs) => {
    const pdf = fs.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'))
    if (!pdf) return toast.error('Please select a valid PDF file')
    setFile(pdf)
    setResult(null)
    setStep(2)
    handleDetect(pdf)
  }, [])

  const handleDetect = async (f) => {
    setDetecting(true)
    try {
        const res = await pdfApi.detectFields(f)
        
        // Show scanning animation for a few seconds to indicate AI processing
        setTimeout(() => {
            setDetecting(false)
            setResult({
                output: res.data.output,
                message: res.data.message
            })
            toast.success('PDF converted to a real-time fillable form! 🚀')
        }, 3000)
    } catch (err) {
        toast.error('Scan failed: ' + err.message)
        setDetecting(false)
        setStep(1)
    }
  }

  const reset = () => {
    setFile(null); setResult(null); setStep(1);
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
            <h1>Real-Time PDF Form Scanner</h1>
            <p>
              Upload any PDF, and our AI will scan it and convert it into a true digital fillable form. 
              Fill the fields <strong>in real-time</strong> directly on the page, then download the result!
            </p>
          </motion.div>
        </div>

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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="card-glass" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                       <div className={`status-dot ${detecting ? 'status-pulse' : 'status-active'}`} />
                       <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                          {detecting ? 'Scanning Document...' : 'Live Digital Form'}
                       </h3>
                  </div>
                  <AnimatePresence>
                      {!detecting && (
                          <motion.span 
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="badge badge-success"
                          >
                              <FiCheckCircle style={{ marginRight: 4 }} /> Ready to Fill!
                          </motion.span>
                      )}
                  </AnimatePresence>
                </div>

                <div className="pdf-editor-container" style={{ 
                  background: '#2d3748', 
                  borderRadius: 16, 
                  height: 700,
                  position: 'relative',
                  overflow: 'auto',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.4)',
                  padding: '40px 0'
                }}>
                  {/* The actual PDF preview or Mock if preview fails */}
                  <div style={{ 
                      width: '90%', 
                      maxWidth: 800,
                      minHeight: 800, 
                      margin: '0 auto', 
                      background: 'white', 
                      position: 'relative',
                      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                      borderRadius: 4,
                      overflow: 'hidden'
                  }}>
                      {result ? (
                          <>
                              <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 50, background: 'var(--accent-indigo)', padding: '6px 12px', borderRadius: 8, color: 'white', fontSize: '0.8rem', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                                  Type directly onto the PDF below!
                              </div>
                              <iframe 
                                  src={`${import.meta.env.VITE_API_URL || ''}${result.output.url}`} 
                                  style={{ width: '100%', height: 800, border: 'none' }}
                                  title="Fillable PDF"
                              />
                          </>
                      ) : (
                          <div style={{ height: 800, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <p style={{ color: 'var(--text-muted)' }}>Preparing interactive form...</p>
                          </div>
                      )}

                      {/* Scanning Animation Line */}
                      <AnimatePresence>
                          {detecting && (
                              <motion.div 
                                  initial={{ top: 0 }}
                                  animate={{ top: '100%' }}
                                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                  style={{ 
                                      position: 'absolute', 
                                      left: 0, 
                                      right: 0, 
                                      height: 4, 
                                      background: 'linear-gradient(to right, transparent, var(--accent-indigo), transparent)',
                                      boxShadow: '0 0 15px var(--accent-indigo)',
                                      zIndex: 10
                                  }}
                              />
                          )}
                      </AnimatePresence>
                  </div>

                  {detecting && (
                      <div style={{ 
                          position: 'absolute', 
                          top: '50%', 
                          left: '50%', 
                          transform: 'translate(-50%, -50%)',
                          textAlign: 'center',
                          zIndex: 30,
                          padding: '24px 40px',
                          background: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: 20,
                          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                          border: '1px solid white'
                      }}>
                           <div className="spinner" style={{ margin: '0 auto 16px', width: 44, height: 44, borderTopColor: 'var(--accent-indigo)' }} />
                           <h4 style={{ color: '#1a202c', marginBottom: 4 }}>Deep AI Scan</h4>
                           <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Identifying structure & embedding fields...</p>
                      </div>
                  )}
                </div>
              </div>
              
              {result && (
                 <ResultPanel result={result} onReset={reset} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
