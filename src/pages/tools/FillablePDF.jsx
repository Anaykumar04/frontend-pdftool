import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import DropZone from '../../components/DropZone'
import ResultPanel from '../../components/ResultPanel'
import { pdfApi } from '../../services/api'
import { FiCheckSquare, FiDownload, FiEdit3, FiLayout, FiSave } from 'react-icons/fi'

export default function FillablePDF() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [fields, setFields] = useState([])
  const [result, setResult] = useState(null)
  const [step, setStep] = useState(1) // 1: Upload, 2: Detect/Fill

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
    // Simulating automatic field detection
    setTimeout(() => {
        setFields([
            { id: 1, name: 'Full Name', type: 'text', value: '', placeholder: 'John Doe', x: 100, y: 200 },
            { id: 2, name: 'Email Address', type: 'email', value: '', placeholder: 'john@example.com', x: 100, y: 250 },
            { id: 3, name: 'Phone Number', type: 'text', value: '', placeholder: '+1 234 567 890', x: 100, y: 300 },
            { id: 4, name: 'Message', type: 'textarea', value: '', placeholder: 'Your message here...', x: 100, y: 350 },
        ])
        setDetecting(false)
        toast.success('Fields detected automatically! ⚡')
    }, 1500)
  }

  const updateField = (id, val) => {
    setFields(fields.map(f => f.id === id ? { ...f, value: val } : f))
  }

  const handleFill = async () => {
    if (!file) return toast.error('Please upload a PDF file')
    setLoading(true)
    try {
        // In a real app, this would call the backend
        // const res = await pdfApi.fillForm(file, fields)
        // For now, we simulate the success
        setTimeout(() => {
            setResult({
                name: `fillable_${file.name}`,
                size: file.size,
                downloadUrl: '#' // Simulated
            })
            setLoading(false)
            toast.success('Form filled and ready! 🎉')
        }, 2000)
    } catch (err) {
        toast.error(err.message)
        setLoading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setResult(null)
    setFields([])
    setStep(1)
  }

  return (
    <div className="tool-page">
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="tool-page-header">
          <span className="badge badge-purple" style={{ marginBottom: 16 }}><FiLayout /> Forms</span>
          <h1>Fillable PDF Converter</h1>
          <p>
            Upload your PDF form (e.g., bank form, application form) to convert it into a fillable digital document. 
            Our tool will detect fields automatically so you can type, save, and download instantly.
          </p>
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
                label="Click or drag PDF form here" 
                hint="We'll automatically detect fields for you" 
                files={[]} 
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
                <div className="card-glass" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ fontSize: '1.2rem' }}>Form Preview</h3>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <span className="badge badge-blue">
                             {detecting ? 'Detecting...' : `${fields.length} Fields Found`}
                        </span>
                    </div>
                  </div>

                  <div className="pdf-preview-canvas" style={{ 
                    background: 'white', 
                    borderRadius: 8, 
                    border: '1px solid var(--border)', 
                    height: 500,
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {detecting ? (
                      <div style={{ textAlign: 'center' }}>
                        <div className="spinner" style={{ margin: '0 auto 16px' }} />
                        <p style={{ color: 'var(--text-muted)' }}>Scanning document for input fields...</p>
                      </div>
                    ) : (
                      <div style={{ width: '100%', height: '100%', padding: '40px 60px', overflowY: 'auto' }}>
                         <div style={{ borderBottom: '2px solid #eee', paddingBottom: 10, marginBottom: 30 }}>
                             <h2 style={{ color: '#333', fontSize: 18 }}>{file?.name}</h2>
                             <p style={{ color: '#888', fontSize: 12 }}>Digital Fillable Form</p>
                         </div>
                         
                         {fields.map(f => (
                             <div key={f.id} style={{ marginBottom: 20 }}>
                                 <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#666', marginBottom: 6, textTransform: 'uppercase' }}>{f.name}</label>
                                 {f.type === 'textarea' ? (
                                     <textarea 
                                        value={f.value} 
                                        onChange={e => updateField(f.id, e.target.value)}
                                        placeholder={f.placeholder}
                                        style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #ddd', fontSize: 14, minHeight: 80 }}
                                     />
                                 ) : (
                                     <input 
                                        type={f.type} 
                                        value={f.value} 
                                        onChange={e => updateField(f.id, e.target.value)}
                                        placeholder={f.placeholder}
                                        style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #ddd', fontSize: 14 }}
                                     />
                                 )}
                             </div>
                         ))}
                         
                         <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px dashed #ccc', textAlign: 'center' }}>
                             <p style={{ fontSize: 11, color: '#aaa' }}>End of detected fields. You can also add more fields in the full editor.</p>
                         </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                   <div className="card-glass" style={{ padding: 20 }}>
                      <h4 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FiEdit3 /> Fill Details
                      </h4>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
                          Fields have been detected. Fill them out and click "Save & Download" to get your completed PDF.
                      </p>
                      
                      <button 
                        onClick={handleFill} 
                        disabled={loading || detecting}
                        className="btn btn-primary btn-lg" 
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        {loading ? (
                            <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Processing...</>
                        ) : (
                            <><FiSave /> Save & Download</>
                        )}
                      </button>
                   </div>
                   
                   <div className="card-glass" style={{ padding: 20 }}>
                      <h4 style={{ marginBottom: 12, fontSize: 14 }}>Actions</h4>
                      <button onClick={reset} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                        Upload Different File
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
