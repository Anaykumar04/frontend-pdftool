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
    // Simulating automatic field detection for a Bank Form
    setTimeout(() => {
        setFields([
            { id: 1, label: 'Full Name', value: '', top: '155px', left: '160px', width: '380px' },
            { id: 2, label: 'Account Number', value: '', top: '210px', left: '160px', width: '220px' },
            { id: 3, label: 'Swift Code', value: '', top: '210px', left: '400px', width: '140px' },
            { id: 4, label: 'Mailing Address', value: '', top: '265px', left: '160px', width: '380px' },
            { id: 5, label: 'City', value: '', top: '320px', left: '160px', width: '180px' },
            { id: 6, label: 'State', value: '', top: '320px', left: '360px', width: '180px' },
            { id: 7, label: 'Contact Phone', value: '', top: '375px', left: '160px', width: '380px' },
            { id: 8, label: 'Reference ID', value: '', top: '430px', left: '160px', width: '180px' },
            { id: 9, label: 'Date', value: '', top: '430px', left: '360px', width: '180px' },
        ])
        setDetecting(false)
        toast.success('Banking form fields detected! 🏦')
    }, 1500)
  }

  const updateField = (id, val) => {
    setFields(fields.map(f => f.id === id ? { ...f, value: val } : f))
  }

  const handleFill = async () => {
    if (!file) return toast.error('Please upload a PDF file')
    setLoading(true)
    try {
        setTimeout(() => {
            setResult({
                name: `bank_form_completed_${file.name}`,
                size: file.size,
                downloadUrl: '#'
            })
            setLoading(false)
            toast.success('Bank form filled successfully! 🏧')
        }, 2000)
    } catch (err) {
        toast.error(err.message); setLoading(false)
    }
  }

  const reset = () => {
    setFile(null); setResult(null); setFields([]); setStep(1)
  }

  return (
    <div className="tool-page">
      <div className="container" style={{ maxWidth: 900 }}>
        <div className="tool-page-header">
          <span className="badge badge-teal" style={{ marginBottom: 16 }}><FiLayout /> Banking Tools</span>
          <h1>Bank Form Filler</h1>
          <p>
            Upload your bank application or transaction form. 
            We'll convert it into a digital fillable version so you can complete your banking tasks instantly.
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
                label="Click or drag BANK FORM here" 
                hint="Commonly supports application forms, KYC, and transfer slips" 
                files={[]} 
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 24 }}>
                <div className="card-glass" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                         <FiLayout color="var(--accent-teal)" />
                         <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Form Interaction View</h3>
                    </div>
                    <span className="badge badge-ghost">
                         {detecting ? 'Detecting...' : '8 Fields Interactive'}
                    </span>
                  </div>

                  <div className="pdf-editor-canvas" style={{ 
                    background: '#f0f2f5', 
                    borderRadius: 12, 
                    height: 600,
                    position: 'relative',
                    overflow: 'auto',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
                  }}>
                    {detecting ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <div className="spinner" style={{ marginBottom: 16, width: 40, height: 40 }} />
                        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Authenticating document structure...</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Scanning for signature lines and account fields</p>
                      </div>
                    ) : (
                      <div style={{ 
                        width: 600, 
                        height: 800, 
                        margin: '20px auto', 
                        background: 'white', 
                        backgroundImage: 'url(/assets/bank-form-mock.png)',
                        backgroundSize: 'cover',
                        position: 'relative',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                        borderRadius: 4
                      }}>
                         {fields.map(f => (
                             <div key={f.id} style={{ 
                                 position: 'absolute', 
                                 top: f.top, 
                                 left: f.left,
                                 width: f.width
                             }}>
                                 <input 
                                    type="text" 
                                    value={f.value} 
                                    placeholder={f.label}
                                    onChange={e => updateField(f.id, e.target.value)}
                                    style={{ 
                                        width: '100%', 
                                        padding: '4px 8px', 
                                        border: '1px solid transparent',
                                        borderBottom: '1px dashed #3182ce',
                                        background: 'rgba(49, 130, 206, 0.05)',
                                        fontSize: 13,
                                        fontWeight: 500,
                                        color: '#2d3748',
                                        transition: 'all 0.2s',
                                        outline: 'none'
                                    }}
                                    onFocus={e => e.target.style.background = 'rgba(49, 130, 206, 0.15)'}
                                    onBlur={e => e.target.style.background = 'rgba(49, 130, 206, 0.05)'}
                                 />
                                 <span style={{ position: 'absolute', top: -14, left: 0, fontSize: 9, color: '#3182ce', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{f.label}</span>
                             </div>
                         ))}
                         
                         <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', padding: '10px 20px', border: '1px solid #eee', color: '#ccc', borderRadius: 4, fontStyle: 'italic', fontSize: 11 }}>
                             Digitally generated by PDFtoolkit Form Processor
                         </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="sidebar">
                  <div className="card-glass" style={{ padding: 20, marginBottom: 16 }}>
                      <h4 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
                          <FiEdit3 /> Input Summary
                      </h4>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>
                          We have localized the bank fields for you. Please review and fill them to proceed with the secure download.
                      </p>
                      
                      <div style={{ display: 'grid', gap: 8, marginBottom: 20 }}>
                          {fields.slice(0, 4).map(f => (
                              <div key={f.id} style={{ fontSize: 11, display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                                  <span>{f.label}:</span>
                                  <span style={{ color: f.value ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                                      {f.value ? '✓ Filled' : 'Empty'}
                                  </span>
                              </div>
                          ))}
                      </div>

                      <button 
                        onClick={handleFill} 
                        disabled={loading || detecting}
                        className="btn btn-primary btn-lg" 
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        {loading ? (
                            <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Saving...</>
                        ) : (
                            <><FiSave /> Save & Secure Download</>
                        )}
                      </button>
                  </div>
                  
                  <div className="card-glass" style={{ padding: 15 }}>
                      <button onClick={reset} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}>
                        Cancel & New Upload
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
