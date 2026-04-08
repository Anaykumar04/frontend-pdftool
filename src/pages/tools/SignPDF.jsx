import { useState, useCallback, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import DropZone from '../../components/DropZone'
import ResultPanel from '../../components/ResultPanel'
import { pdfApi } from '../../services/api'
import { FiType, FiUpload, FiEdit2, FiTrash2, FiSquare, FiRotateCw } from 'react-icons/fi'

export default function SignPDF() {
  const [file, setFile] = useState(null)
  const [activeTab, setActiveTab] = useState('draw') // 'draw', 'type', 'upload'
  const [position, setPosition] = useState('bottom-right')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  // Type State
  const [signatureText, setSignatureText] = useState('')
  const [color, setColor] = useState('#000000')

  // Draw State
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)

  // Upload State
  const [uploadedSign, setUploadedSign] = useState(null)

  useEffect(() => {
    if (activeTab === 'draw' && canvasRef.current) {
        initCanvas()
    }
  }, [activeTab])

  const initCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
  }

  useEffect(() => {
    if (canvasRef.current) initCanvas()
  }, [color])

  const onFiles = useCallback((fs) => {
    const pdf = fs.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'))
    if (!pdf) return toast.error('Please select a valid PDF file')
    setFile(pdf); setResult(null)
  }, [])

  const handlePointerDown = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const handlePointerMove = (e) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const handlePointerUp = () => setIsDrawing(false)

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const handleSign = async () => {
    if (!file) return toast.error('Please upload a PDF file')
    setLoading(true); setResult(null)
    try {
        let res;
        if (activeTab === 'type') {
            if (!signatureText.trim()) throw new Error('Please enter your name')
            res = await pdfApi.addStamp(file, signatureText, color)
        } else if (activeTab === 'draw') {
            const blob = await new Promise(resolve => canvasRef.current.toBlob(resolve))
            res = await pdfApi.signImage(file, blob, position)
        } else if (activeTab === 'upload') {
            if (!uploadedSign) throw new Error('Please upload your signature image')
            res = await pdfApi.signImage(file, uploadedSign, position)
        }
        setResult(res.data)
        toast.success('PDF signed successfully! 🎉')
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const reset = () => {
    setFile(null); setResult(null); 
    setSignatureText(''); setUploadedSign(null);
    if (activeTab === 'draw') setTimeout(clearCanvas, 10)
  }

  return (
    <div className="tool-page">
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="tool-page-header">
          <span className="badge badge-teal" style={{ marginBottom: 16 }}>✍️ Security</span>
          <h1>E-Signature Tool</h1>
          <p>Sign your PDF documents with a typed, drawn, or uploaded signature.</p>
        </div>

        {result ? <ResultPanel result={result} onReset={reset} /> : (
          <div className="sign-workflow">
            {!file ? (
                <DropZone onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false}
                label="Click or drag PDF here" hint="Upload a PDF to start signing" files={[]} />
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 24 }}>
                    {/* Main Signature Area */}
                    <div className="card-glass" style={{ padding: 24 }}>
                        <div className="tabs" style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.2)', padding: 4, borderRadius: 10, marginBottom: 20 }}>
                            {[
                                { id: 'draw', icon: <FiEdit2 />, label: 'Draw' },
                                { id: 'type', icon: <FiType />, label: 'Type' },
                                { id: 'upload', icon: <FiUpload />, label: 'Upload' }
                            ].map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
                                    style={{ flex: 1, gap: 8 }}>
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="tab-content" style={{ minHeight: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.1)', borderRadius: 12, border: '1px solid var(--border-light)' }}>
                            {activeTab === 'draw' && (
                                <div style={{ position: 'relative', width: '100%', height: 240 }}>
                                    <canvas ref={canvasRef} width={460} height={200}
                                        onPointerDown={handlePointerDown}
                                        onPointerMove={handlePointerMove}
                                        onPointerUp={handlePointerUp}
                                        onPointerLeave={handlePointerUp}
                                        style={{ 
                                            background: 'white', cursor: 'crosshair', 
                                            borderRadius: 8, display: 'block', margin: '20px auto',
                                            touchAction: 'none'
                                        }} />
                                    <button className="btn btn-ghost btn-sm" onClick={clearCanvas} 
                                        style={{ position: 'absolute', bottom: 10, right: 10 }}>
                                        <FiTrash2 /> Clear
                                    </button>
                                </div>
                            )}

                            {activeTab === 'type' && (
                                <div style={{ width: '100%', padding: 40, textAlign: 'center' }}>
                                    <input type="text" value={signatureText} onChange={e => setSignatureText(e.target.value)}
                                        placeholder="Type your name here..."
                                        style={{ 
                                            fontSize: 32, fontFamily: 'cursive', textAlign: 'center',
                                            background: 'transparent', border: 'none', borderBottom: '2px solid var(--border)',
                                            borderRadius: 0, padding: '10px 0', width: '80%'
                                        }} />
                                </div>
                            )}

                            {activeTab === 'upload' && (
                                <div style={{ width: '100%', padding: 20 }}>
                                     {uploadedSign ? (
                                         <div style={{ textAlign: 'center' }}>
                                             <img src={URL.createObjectURL(uploadedSign)} alt="Sig" style={{ maxHeight: 160, borderRadius: 8 }} />
                                             <button className="btn btn-ghost btn-sm" onClick={() => setUploadedSign(null)} style={{ display: 'block', margin: '10px auto' }}>Change</button>
                                         </div>
                                     ) : (
                                         <div onClick={() => document.getElementById('sig-up').click()} 
                                              style={{ height: 160, border: '2px dashed var(--border)', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                              <FiUpload size={32} color="var(--accent-purple)" />
                                              <p style={{ marginTop: 10, fontSize: 13 }}>Click to upload signature (PNG/JPG)</p>
                                              <input id="sig-up" type="file" hidden accept="image/*" onChange={e => setUploadedSign(e.target.files[0])} />
                                         </div>
                                     )}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                             <div style={{ display: 'flex', gap: 10 }}>
                                 {['#000000', '#0000FF', '#FF0000'].map(c => (
                                     <button key={c} onClick={() => setColor(c)}
                                         style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: color === c ? '2px solid white' : 'none', cursor: 'pointer' }} />
                                 ))}
                             </div>
                             <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                 <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>File:</span>
                                 <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--accent-purple-light)' }}>{file.name.slice(0, 15)}...</span>
                                 <button onClick={() => setFile(null)} className="btn btn-ghost btn-icon btn-sm"><FiRotateCw /></button>
                             </div>
                        </div>
                    </div>

                    {/* Sidebar Options */}
                    <div>
                        <div className="card-glass" style={{ padding: 20, marginBottom: 16 }}>
                            <h4 style={{ marginBottom: 12, fontSize: 14 }}>Signature Position</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                {[
                                    { id: 'top-left', label: 'Top Left' },
                                    { id: 'top-right', label: 'Top Right' },
                                    { id: 'bottom-left', label: 'Bottom Left' },
                                    { id: 'bottom-right', label: 'Bottom Right' },
                                    { id: 'center', label: 'Center' }
                                ].map(p => (
                                    <button key={p.id} onClick={() => setPosition(p.id)}
                                        className={`btn btn-sm ${position === p.id ? 'btn-primary' : 'btn-ghost'}`}
                                        style={{ justifyContent: 'center', fontSize: 11 }}>
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={handleSign} disabled={loading}
                             className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                             {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Processing...</> : '✍️ Apply & Sign'}
                        </button>
                    </div>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
