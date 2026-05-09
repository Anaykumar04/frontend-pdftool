import { useState, useCallback, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import api from '../../services/api'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

// ─── Constants ────────────────────────────────────────────────────────────────
const TOOLS = [
  { id: 'select', icon: '✋', label: 'Select' },
  { id: 'text',   icon: 'T',   label: 'Add Text' },
  { id: 'highlight', icon: '🖊', label: 'Highlight' },
  { id: 'draw',   icon: '✏️',  label: 'Draw' },
  { id: 'crop',   icon: '⬚',   label: 'Crop' },
  { id: 'image',  icon: '🖼️', label: 'Add Image' },
  { id: 'sign',   icon: '✍️',  label: 'Signature' },
]

const FONTS = ['Helvetica', 'Times New Roman', 'Courier', 'Arial', 'Georgia']
const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64]

const CARD = {
  background: 'rgba(30,41,59,0.6)',
  backdropFilter: 'blur(16px)',
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.07)',
}

const ICON_BTN = {
  padding: '4px 10px',
  borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.05)',
  color: '#94a3b8',
  cursor: 'pointer',
  fontSize: '0.9rem',
}

// ─── CropOverlay ─────────────────────────────────────────────────────────────
function CropOverlay({ onApply, onCancel }) {
  const [box, setBox] = useState({ x: 10, y: 10, w: 80, h: 80 })
  const dragging = useRef(false)
  const resizing = useRef(null)
  const origin = useRef({})
  const containerRef = useRef(null)

  const getRelative = (clientX, clientY) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return { dx: 0, dy: 0 }
    return {
      dx: ((clientX - origin.current.mx) / rect.width) * 100,
      dy: ((clientY - origin.current.my) / rect.height) * 100,
    }
  }

  const startDrag = (e) => {
    e.stopPropagation()
    dragging.current = true
    origin.current = { mx: e.clientX, my: e.clientY, ...box }
    const onMove = (ev) => {
      if (!dragging.current) return
      const { dx, dy } = getRelative(ev.clientX, ev.clientY)
      setBox(b => ({
        ...b,
        x: Math.max(0, Math.min(100 - b.w, origin.current.x + dx)),
        y: Math.max(0, Math.min(100 - b.h, origin.current.y + dy)),
      }))
    }
    const onUp = () => {
      dragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const startResize = (e, corner) => {
    e.stopPropagation()
    resizing.current = corner
    origin.current = { mx: e.clientX, my: e.clientY, ...box }
    const onMove = (ev) => {
      if (!resizing.current) return
      const { dx, dy } = getRelative(ev.clientX, ev.clientY)
      setBox(() => {
        let { x, y, w, h } = origin.current
        if (corner.includes('e')) w = Math.max(10, w + dx)
        if (corner.includes('s')) h = Math.max(10, h + dy)
        if (corner.includes('w')) { x = Math.min(x + w - 10, x + dx); w = Math.max(10, w - dx) }
        if (corner.includes('n')) { y = Math.min(y + h - 10, y + dy); h = Math.max(10, h - dy) }
        return { x, y, w, h }
      })
    }
    const onUp = () => {
      resizing.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const handles = [
    { id: 'nw', style: { top: -5, left: -5, cursor: 'nw-resize' } },
    { id: 'ne', style: { top: -5, right: -5, cursor: 'ne-resize' } },
    { id: 'sw', style: { bottom: -5, left: -5, cursor: 'sw-resize' } },
    { id: 'se', style: { bottom: -5, right: -5, cursor: 'se-resize' } },
    { id: 'n',  style: { top: -5, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' } },
    { id: 's',  style: { bottom: -5, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' } },
    { id: 'e',  style: { right: -5, top: '50%', transform: 'translateY(-50%)', cursor: 'e-resize' } },
    { id: 'w',  style: { left: -5, top: '50%', transform: 'translateY(-50%)', cursor: 'w-resize' } },
  ]

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, zIndex: 50 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', pointerEvents: 'none' }} />
      {/* Cutout — clear the crop area */}
      <div style={{
        position: 'absolute',
        left: `${box.x}%`, top: `${box.y}%`,
        width: `${box.w}%`, height: `${box.h}%`,
        background: 'transparent',
        boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
        border: '2px solid #8b5cf6',
        cursor: 'move',
        boxSizing: 'border-box',
      }} onMouseDown={startDrag}>
        {/* Rule-of-thirds grid */}
        {[33, 66].map(p => (
          <div key={`v${p}`} style={{ position: 'absolute', left: `${p}%`, top: 0, bottom: 0, width: 1, background: 'rgba(139,92,246,0.3)', pointerEvents: 'none' }} />
        ))}
        {[33, 66].map(p => (
          <div key={`h${p}`} style={{ position: 'absolute', top: `${p}%`, left: 0, right: 0, height: 1, background: 'rgba(139,92,246,0.3)', pointerEvents: 'none' }} />
        ))}
        {handles.map(h => (
          <div key={h.id} onMouseDown={e => startResize(e, h.id)}
            style={{ position: 'absolute', width: 10, height: 10, background: '#8b5cf6', borderRadius: 2, zIndex: 2, ...h.style }} />
        ))}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: 'white', fontSize: 11, whiteSpace: 'nowrap', pointerEvents: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.9)', background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: 4 }}>
          {Math.round(box.w)}% × {Math.round(box.h)}%
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 60 }}>
        <button onClick={() => onApply(box)} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#8b5cf6', color: 'white', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(139,92,246,0.4)' }}>✓ Apply Crop</button>
        <button onClick={onCancel} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: 'white', cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  )
}

// ─── SignaturePad ─────────────────────────────────────────────────────────────
function SignaturePad({ onDone, onCancel }) {
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const lastPos = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const src = e.touches ? e.touches[0] : e
    return { x: src.clientX - rect.left, y: src.clientY - rect.top }
  }

  const start = (e) => {
    drawing.current = true
    const pos = getPos(e)
    lastPos.current = pos
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  const move = (e) => {
    if (!drawing.current) return
    e.preventDefault()
    const pos = getPos(e)
    const ctx = canvasRef.current.getContext('2d')
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPos.current = pos
  }

  const end = () => { drawing.current = false }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const done = () => {
    canvasRef.current.toBlob(blob => onDone(blob), 'image/png')
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#1e293b', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)', minWidth: 460 }}>
        <h3 style={{ color: '#e2e8f0', marginBottom: 4, fontSize: '1rem', fontWeight: 600 }}>✍️ Draw Your Signature</h3>
        <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 16 }}>Use your mouse or touch to sign below</p>
        <canvas ref={canvasRef} width={420} height={160}
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end}
          style={{ border: '2px dashed rgba(139,92,246,0.4)', borderRadius: 8, cursor: 'crosshair', display: 'block', touchAction: 'none', background: 'white' }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button onClick={clear} style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}>🗑️ Clear</button>
          <button onClick={onCancel} style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
          <button onClick={done} style={{ flex: 2, padding: '8px', borderRadius: 8, border: 'none', background: '#8b5cf6', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>✓ Add Signature</button>
        </div>
      </div>
    </div>
  )
}

// ─── DrawCanvas ───────────────────────────────────────────────────────────────
// Transparent canvas overlay for freehand drawing on a single page
function DrawCanvas({ width, height, color, strokeWidth, onPathComplete }) {
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const points = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, width, height)
  }, [width, height])

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const startDraw = (e) => {
    drawing.current = true
    points.current = []
    const pos = getPos(e)
    points.current.push(pos)
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    ctx.strokeStyle = color
    ctx.lineWidth = strokeWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }

  const draw = (e) => {
    if (!drawing.current) return
    const pos = getPos(e)
    points.current.push(pos)
    const ctx = canvasRef.current.getContext('2d')
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  const endDraw = () => {
    if (!drawing.current) return
    drawing.current = false
    if (points.current.length > 1) {
      onPathComplete(points.current)
    }
    // Clear canvas — the path is now stored in state and re-rendered via SVG
    const ctx = canvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    points.current = []
  }

  return (
    <canvas ref={canvasRef}
      onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'crosshair', zIndex: 20, touchAction: 'none' }} />
  )
}

// ─── AnnotationLayer ─────────────────────────────────────────────────────────
// Renders all annotations for the current page as SVG + HTML overlays
function AnnotationLayer({ annotations, currentPage, editingId, onSelect, onUpdate, onDelete, pageWidth, pageHeight }) {
  const pageAnns = annotations.filter(a => a.page === currentPage)

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
      {/* SVG layer for draw paths and highlights */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
        {pageAnns.filter(a => a.type === 'draw').map(a => (
          <polyline key={a.id}
            points={a.points.map(p => `${(p.x / 100) * pageWidth},${(p.y / 100) * pageHeight}`).join(' ')}
            fill="none" stroke={a.color} strokeWidth={a.strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {pageAnns.filter(a => a.type === 'highlight').map(a => (
          <rect key={a.id}
            x={`${a.x}%`} y={`${a.y}%`}
            width={`${a.w}%`} height={`${a.h}%`}
            fill={a.color} fillOpacity={0.35} rx={2} />
        ))}
      </svg>

      {/* HTML layer for text and image annotations */}
      {pageAnns.filter(a => a.type === 'text' || a.type === 'image').map(a => (
        <AnnotationItem key={a.id} ann={a} isEditing={editingId === a.id}
          onSelect={onSelect} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </div>
  )
}

function AnnotationItem({ ann, isEditing, onSelect, onUpdate, onDelete }) {
  const ref = useRef(null)
  const dragging = useRef(false)
  const origin = useRef({})

  const onMouseDown = (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') return
    e.stopPropagation()
    dragging.current = true
    origin.current = { mx: e.clientX, my: e.clientY, ax: ann.x, ay: ann.y }
    const onMove = (ev) => {
      if (!dragging.current) return
      const parent = ref.current?.parentElement?.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      const dx = ((ev.clientX - origin.current.mx) / rect.width) * 100
      const dy = ((ev.clientY - origin.current.my) / rect.height) * 100
      onUpdate(ann.id, 'x', Math.max(0, Math.min(100, origin.current.ax + dx)))
      onUpdate(ann.id, 'y', Math.max(0, Math.min(100, origin.current.ay + dy)))
    }
    const onUp = () => {
      dragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div ref={ref}
      onMouseDown={onMouseDown}
      onClick={e => { e.stopPropagation(); onSelect(ann.id) }}
      style={{
        position: 'absolute',
        left: `${ann.x}%`, top: `${ann.y}%`,
        transform: 'translate(-50%, -50%)',
        cursor: 'move',
        zIndex: 15,
        userSelect: 'none',
        pointerEvents: 'all',
        outline: isEditing ? '2px solid #8b5cf6' : 'none',
        borderRadius: 4,
      }}>
      {ann.type === 'text' && (
        isEditing ? (
          <div style={{ background: 'white', border: '2px solid #8b5cf6', borderRadius: 6, padding: '4px 6px', boxShadow: '0 4px 16px rgba(0,0,0,0.4)', minWidth: 120 }}>
            <input autoFocus value={ann.text}
              onChange={e => onUpdate(ann.id, 'text', e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: ann.fontSize, color: ann.color, fontFamily: ann.fontFamily, fontWeight: ann.fontWeight, fontStyle: ann.fontStyle, minWidth: 80, background: 'transparent', display: 'block', width: '100%' }} />
            <div style={{ display: 'flex', gap: 4, marginTop: 4, alignItems: 'center' }}>
              <input type="number" value={ann.fontSize} min={8} max={72}
                onChange={e => onUpdate(ann.id, 'fontSize', Number(e.target.value))}
                style={{ width: 44, fontSize: 11, border: '1px solid #ddd', borderRadius: 3, padding: '2px 4px' }} />
              <input type="color" value={ann.color}
                onChange={e => onUpdate(ann.id, 'color', e.target.value)}
                style={{ width: 26, height: 26, border: 'none', cursor: 'pointer', borderRadius: 3 }} />
              <button onClick={e => { e.stopPropagation(); onDelete(ann.id) }}
                style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 3, padding: '2px 7px', cursor: 'pointer', fontSize: 11 }}>✕</button>
            </div>
          </div>
        ) : (
          <span style={{ fontSize: ann.fontSize, color: ann.color, fontFamily: ann.fontFamily, fontWeight: ann.fontWeight, fontStyle: ann.fontStyle, whiteSpace: 'nowrap', padding: '1px 3px', borderRadius: 2, background: 'rgba(255,255,255,0.15)' }}>
            {ann.text}
          </span>
        )
      )}
      {ann.type === 'image' && (
        <div style={{ position: 'relative' }}>
          <img src={ann.src} alt="annotation"
            style={{ width: `${ann.w}vw`, maxWidth: 300, minWidth: 40, display: 'block', borderRadius: 4, boxShadow: isEditing ? '0 0 0 2px #8b5cf6' : 'none' }} />
          {isEditing && (
            <button onClick={e => { e.stopPropagation(); onDelete(ann.id) }}
              style={{ position: 'absolute', top: -10, right: -10, width: 20, height: 20, borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main PDFEditor ───────────────────────────────────────────────────────────
export default function PDFEditor() {
  // ── Core state ──────────────────────────────────────────────────────────────
  const [file, setFile] = useState(null)
  const [fileUrl, setFileUrl] = useState(null)
  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [scale, setScale] = useState(1.2)
  const [activeTool, setActiveTool] = useState('select')
  const [activeTab, setActiveTab] = useState('annotate')

  // ── Annotations + history ────────────────────────────────────────────────────
  const [annotations, setAnnotations] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [history, setHistory] = useState([[]])
  const [historyIndex, setHistoryIndex] = useState(0)

  // ── Tool-specific state ──────────────────────────────────────────────────────
  const [showCrop, setShowCrop] = useState(false)
  const [showSignPad, setShowSignPad] = useState(false)
  const [cropBoxes, setCropBoxes] = useState({})
  const [drawColor, setDrawColor] = useState('#e11d48')
  const [drawWidth, setDrawWidth] = useState(3)
  const [highlightColor, setHighlightColor] = useState('#fde047')
  const [highlightStart, setHighlightStart] = useState(null)
  const [textProps, setTextProps] = useState({
    fontSize: 14, color: '#000000',
    fontStyle: 'normal', fontWeight: 'normal', fontFamily: 'Helvetica',
  })

  // ── Page dimensions (for SVG draw rendering) ─────────────────────────────────
  const [pageDims, setPageDims] = useState({ width: 595, height: 842 })

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const pageRef = useRef(null)
  const imageInputRef = useRef(null)

  // ── History helpers ──────────────────────────────────────────────────────────
  const pushHistory = useCallback((anns) => {
    setHistory(h => {
      const trimmed = h.slice(0, historyIndex + 1)
      return [...trimmed, anns]
    })
    setHistoryIndex(i => i + 1)
  }, [historyIndex])

  const undo = useCallback(() => {
    if (historyIndex <= 0) return
    const prev = history[historyIndex - 1]
    setAnnotations(prev)
    setHistoryIndex(i => i - 1)
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return
    const next = history[historyIndex + 1]
    setAnnotations(next)
    setHistoryIndex(i => i + 1)
  }, [history, historyIndex])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo() }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])

  // ── Annotation CRUD ──────────────────────────────────────────────────────────
  const addAnnotation = useCallback((ann) => {
    setAnnotations(prev => {
      const next = [...prev, ann]
      pushHistory(next)
      return next
    })
  }, [pushHistory])

  const updateAnnotation = useCallback((id, field, value) => {
    setAnnotations(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a))
  }, [])

  const deleteAnnotation = useCallback((id) => {
    setAnnotations(prev => {
      const next = prev.filter(a => a.id !== id)
      pushHistory(next)
      return next
    })
    setEditingId(null)
  }, [pushHistory])

  // ── File handling ────────────────────────────────────────────────────────────
  const onFileChange = useCallback((e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.pdf') && f.type !== 'application/pdf') {
      toast.error('Please select a PDF file')
      return
    }
    setFile(f)
    setFileUrl(URL.createObjectURL(f))
    setAnnotations([])
    setResult(null)
    setCurrentPage(1)
    setHistory([[]])
    setHistoryIndex(0)
    setCropBoxes({})
    setEditingId(null)
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) onFileChange({ target: { files: [f] } })
  }, [onFileChange])

  // ── Page click handler ───────────────────────────────────────────────────────
  const handlePageClick = useCallback((e) => {
    if (activeTool === 'crop' || activeTool === 'draw') return
    const rect = pageRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    if (activeTool === 'text') {
      const id = Date.now()
      addAnnotation({ id, type: 'text', x, y, text: 'New text', page: currentPage, ...textProps })
      setEditingId(id)
    } else if (activeTool === 'select') {
      setEditingId(null)
    }
  }, [activeTool, currentPage, textProps, addAnnotation])

  // ── Highlight drag ───────────────────────────────────────────────────────────
  const handleHighlightMouseDown = useCallback((e) => {
    if (activeTool !== 'highlight') return
    const rect = pageRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setHighlightStart({ x, y, mx: e.clientX, my: e.clientY })
  }, [activeTool])

  const handleHighlightMouseUp = useCallback((e) => {
    if (activeTool !== 'highlight' || !highlightStart) return
    const rect = pageRef.current?.getBoundingClientRect()
    if (!rect) return
    const x2 = ((e.clientX - rect.left) / rect.width) * 100
    const y2 = ((e.clientY - rect.top) / rect.height) * 100
    const x = Math.min(highlightStart.x, x2)
    const y = Math.min(highlightStart.y, y2)
    const w = Math.abs(x2 - highlightStart.x)
    const h = Math.abs(y2 - highlightStart.y)
    if (w > 1 && h > 0.5) {
      addAnnotation({ id: Date.now(), type: 'highlight', x, y, w, h, page: currentPage, color: highlightColor })
    }
    setHighlightStart(null)
  }, [activeTool, highlightStart, currentPage, highlightColor, addAnnotation])

  // ── Draw path complete ───────────────────────────────────────────────────────
  const handlePathComplete = useCallback((rawPoints) => {
    const rect = pageRef.current?.getBoundingClientRect()
    if (!rect) return
    const points = rawPoints.map(p => ({
      x: (p.x / rect.width) * 100,
      y: (p.y / rect.height) * 100,
    }))
    addAnnotation({ id: Date.now(), type: 'draw', points, page: currentPage, color: drawColor, strokeWidth: drawWidth })
  }, [currentPage, drawColor, drawWidth, addAnnotation])

  // ── Image upload ─────────────────────────────────────────────────────────────
  const handleImageUpload = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      addAnnotation({ id: Date.now(), type: 'image', x: 50, y: 50, w: 20, src: ev.target.result, page: currentPage })
    }
    reader.readAsDataURL(f)
    e.target.value = ''
  }

  // ── Signature ────────────────────────────────────────────────────────────────
  const handleSignatureDone = (blob) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      addAnnotation({ id: Date.now(), type: 'image', x: 50, y: 80, w: 20, src: ev.target.result, page: currentPage })
    }
    reader.readAsDataURL(blob)
    setShowSignPad(false)
    toast.success('Signature added!')
  }

  // ── Crop ─────────────────────────────────────────────────────────────────────
  const handleCropApply = (box) => {
    setCropBoxes(prev => ({ ...prev, [currentPage]: box }))
    setShowCrop(false)
    setActiveTool('select')
    toast.success(`Crop applied to page ${currentPage}`)
  }

  // ── Tool activation ──────────────────────────────────────────────────────────
  const handleToolClick = (toolId) => {
    if (toolId === 'crop') { setActiveTool('crop'); setShowCrop(true); return }
    if (toolId === 'sign') { setShowSignPad(true); return }
    if (toolId === 'image') { imageInputRef.current?.click(); return }
    setActiveTool(toolId)
    setShowCrop(false)
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!file) return toast.error('Please upload a PDF file')
    setLoading(true)
    setResult(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const edits = annotations
        .filter(a => a.type === 'text')
        .map(a => ({
          text: a.text,
          x: (a.x / 100) * 595,
          y: 842 - (a.y / 100) * 842,
          size: a.fontSize || 14,
          pageIndex: a.page - 1,
        }))
      form.append('edits', JSON.stringify(edits))
      const res = await api.post('/pdf/edit-pdf', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(res.data)
      toast.success('PDF saved successfully!')
    } catch (err) {
      toast.error(err.message || 'Failed to save PDF')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setFile(null); setFileUrl(null); setAnnotations([])
    setResult(null); setCurrentPage(1); setScale(1.2)
    setHistory([[]]); setHistoryIndex(0); setCropBoxes({})
    setEditingId(null); setActiveTool('select')
  }

  const scalePercent = Math.round(scale * 100)
  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1
  const currentCrop = cropBoxes[currentPage]

  // ── Result screen ─────────────────────────────────────────────────────────────
  if (result) {
    const url = result.output?.url
    const safeUrl = url?.startsWith('http://') ? url.replace('http://', 'https://') : url
    return (
      <div className="tool-page">
        <div className="container" style={{ maxWidth: 600 }}>
          <div style={{ ...CARD, padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h2 className="gradient-text" style={{ marginBottom: 8 }}>PDF Saved!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Your edited PDF is ready to download.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {safeUrl && (
                <a href={safeUrl} download target="_blank" rel="noreferrer" className="btn btn-primary btn-lg">
                  ⬇️ Download PDF
                </a>
              )}
              <button onClick={reset} className="btn btn-outline btn-lg">🔄 Edit Another</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Upload screen ─────────────────────────────────────────────────────────────
  if (!file) {
    return (
      <div className="tool-page">
        <div className="container" style={{ maxWidth: 600 }}>
          <div className="tool-page-header">
            <span className="badge badge-purple" style={{ marginBottom: 16 }}>✏️ Editor</span>
            <h1>PDF Editor</h1>
            <p>View, annotate and add text to your PDF documents.</p>
          </div>
          <div
            onDrop={onDrop} onDragOver={e => e.preventDefault()}
            style={{ ...CARD, padding: 60, textAlign: 'center', border: '2px dashed rgba(139,92,246,0.4)', cursor: 'pointer', transition: 'border-color 0.2s' }}
            onClick={() => document.getElementById('pdf-editor-input').click()}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📄</div>
            <h3 style={{ marginBottom: 8 }}>Click or drag PDF here</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Upload a PDF to start editing</p>
            <button className="btn btn-primary">Choose PDF File</button>
            <input id="pdf-editor-input" type="file" accept=".pdf,application/pdf" style={{ display: 'none' }} onChange={onFileChange} />
          </div>
        </div>
      </div>
    )
  }

  // ── Editor UI ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', background: '#1a1a2e', overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Top Toolbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0, flexWrap: 'wrap', zIndex: 100 }}>

        {/* Tab buttons */}
        <div style={{ display: 'flex', gap: 3, marginRight: 6 }}>
          {['annotate', 'edit'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: '5px 13px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, background: activeTab === tab ? '#8b5cf6' : 'rgba(255,255,255,0.07)', color: activeTab === tab ? 'white' : '#94a3b8', transition: 'all 0.15s' }}>
              {tab === 'annotate' ? '✏️ Annotate' : '⚙️ Edit'}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.1)', marginRight: 2 }} />

        {/* Tool buttons */}
        {TOOLS.map(t => (
          <button key={t.id} onClick={() => handleToolClick(t.id)} title={t.label}
            style={{ padding: '5px 9px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: t.id === 'text' ? '0.85rem' : '1rem', fontWeight: t.id === 'text' ? 700 : 400, background: activeTool === t.id ? 'rgba(139,92,246,0.3)' : 'transparent', color: activeTool === t.id ? '#c4b5fd' : '#94a3b8', transition: 'all 0.15s', outline: activeTool === t.id ? '1px solid rgba(139,92,246,0.5)' : 'none' }}>
            {t.icon}
          </button>
        ))}

        <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.1)', margin: '0 2px' }} />

        {/* Undo / Redo */}
        <button onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)"
          style={{ ...ICON_BTN, opacity: canUndo ? 1 : 0.35 }}>↩</button>
        <button onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)"
          style={{ ...ICON_BTN, opacity: canRedo ? 1 : 0.35 }}>↪</button>

        <div style={{ flex: 1 }} />

        {/* Draw color + width (shown when draw tool active) */}
        {activeTool === 'draw' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 8 }}>
            <input type="color" value={drawColor} onChange={e => setDrawColor(e.target.value)}
              title="Draw color" style={{ width: 28, height: 28, border: 'none', cursor: 'pointer', borderRadius: 4 }} />
            <input type="range" min={1} max={12} value={drawWidth} onChange={e => setDrawWidth(Number(e.target.value))}
              style={{ width: 70, accentColor: '#8b5cf6' }} />
            <span style={{ color: '#94a3b8', fontSize: '0.75rem', minWidth: 16 }}>{drawWidth}px</span>
          </div>
        )}

        {/* Highlight color (shown when highlight tool active) */}
        {activeTool === 'highlight' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 8 }}>
            <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Color:</span>
            {['#fde047','#86efac','#93c5fd','#f9a8d4','#fdba74'].map(c => (
              <button key={c} onClick={() => setHighlightColor(c)}
                style={{ width: 20, height: 20, borderRadius: '50%', background: c, border: highlightColor === c ? '2px solid white' : '2px solid transparent', cursor: 'pointer' }} />
            ))}
          </div>
        )}

        {/* Zoom controls */}
        <button onClick={() => setScale(s => Math.max(0.4, +(s - 0.1).toFixed(1)))} style={ICON_BTN} title="Zoom out">−</button>
        <span style={{ color: '#94a3b8', fontSize: '0.82rem', minWidth: 42, textAlign: 'center' }}>{scalePercent}%</span>
        <button onClick={() => setScale(s => Math.min(3, +(s + 0.1).toFixed(1)))} style={ICON_BTN} title="Zoom in">+</button>

        <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

        {/* Save */}
        <button onClick={handleSave} disabled={loading}
          style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: loading ? '#6d28d9' : '#8b5cf6', color: 'white', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.82rem', transition: 'background 0.15s' }}>
          {loading ? '⏳ Saving…' : '💾 Save PDF'}
        </button>
        <button onClick={reset} style={{ ...ICON_BTN, color: '#ef4444' }} title="Close editor">✕</button>
      </div>

      {/* ── Main area ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Left sidebar: thumbnails ── */}
        <div style={{ width: 156, background: 'rgba(10,15,30,0.85)', borderRight: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', padding: '10px 6px', flexShrink: 0 }}>
          <div style={{ fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 4 }}>Pages</div>
          <Document file={fileUrl} onLoadSuccess={({ numPages: n }) => setNumPages(n)} loading={null} error={null}>
            {Array.from({ length: numPages }, (_, i) => i + 1).map(p => (
              <div key={p} onClick={() => setCurrentPage(p)}
                style={{ marginBottom: 10, cursor: 'pointer', border: currentPage === p ? '2px solid #8b5cf6' : '2px solid transparent', borderRadius: 6, overflow: 'hidden', background: 'white', transition: 'border-color 0.15s', boxShadow: currentPage === p ? '0 0 0 1px rgba(139,92,246,0.4)' : 'none' }}>
                <Page pageNumber={p} width={128} renderTextLayer={false} renderAnnotationLayer={false} loading={null} />
                <div style={{ textAlign: 'center', fontSize: 10, color: currentPage === p ? '#8b5cf6' : '#64748b', padding: '3px 0', background: 'rgba(10,15,30,0.9)', fontWeight: currentPage === p ? 600 : 400 }}>{p}</div>
              </div>
            ))}
          </Document>
        </div>

        {/* ── Center: PDF viewer + overlays ── */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: 28, background: '#374151' }}>
          <div
            ref={pageRef}
            style={{
              position: 'relative',
              display: 'inline-block',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
              cursor: activeTool === 'text' ? 'crosshair' : activeTool === 'highlight' ? 'text' : activeTool === 'draw' ? 'crosshair' : 'default',
              userSelect: 'none',
            }}
            onClick={handlePageClick}
            onMouseDown={handleHighlightMouseDown}
            onMouseUp={handleHighlightMouseUp}
          >
            {/* PDF page */}
            <Document
              file={fileUrl}
              loading={<div style={{ color: 'white', padding: 40, fontSize: '0.9rem' }}>⏳ Loading PDF…</div>}
              error={<div style={{ color: '#ef4444', padding: 40 }}>Failed to load PDF</div>}
            >
              <Page
                pageNumber={currentPage}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                onRenderSuccess={(page) => {
                  setPageDims({ width: page.width, height: page.height })
                }}
              />
            </Document>

            {/* Annotation overlay */}
            <AnnotationLayer
              annotations={annotations}
              currentPage={currentPage}
              editingId={editingId}
              onSelect={setEditingId}
              onUpdate={updateAnnotation}
              onDelete={deleteAnnotation}
              pageWidth={pageDims.width}
              pageHeight={pageDims.height}
            />

            {/* Crop indicator (applied) */}
            {currentCrop && !showCrop && (
              <div style={{
                position: 'absolute',
                left: `${currentCrop.x}%`, top: `${currentCrop.y}%`,
                width: `${currentCrop.w}%`, height: `${currentCrop.h}%`,
                border: '2px dashed rgba(139,92,246,0.6)',
                pointerEvents: 'none', zIndex: 30,
              }} />
            )}

            {/* Crop overlay (active) */}
            {showCrop && (
              <CropOverlay onApply={handleCropApply} onCancel={() => { setShowCrop(false); setActiveTool('select') }} />
            )}

            {/* Draw canvas (active when draw tool selected) */}
            {activeTool === 'draw' && !showCrop && (
              <DrawCanvas
                width={pageDims.width}
                height={pageDims.height}
                color={drawColor}
                strokeWidth={drawWidth}
                onPathComplete={handlePathComplete}
              />
            )}

            {/* Highlight drag preview */}
            {highlightStart && activeTool === 'highlight' && (
              <div style={{
                position: 'absolute',
                left: `${highlightStart.x}%`, top: `${highlightStart.y}%`,
                width: '1%', height: '1%',
                background: highlightColor, opacity: 0.4,
                pointerEvents: 'none', zIndex: 25,
              }} />
            )}
          </div>
        </div>

        {/* ── Right: Properties panel ── */}
        <div style={{ width: 224, background: 'rgba(10,15,30,0.85)', borderLeft: '1px solid rgba(255,255,255,0.06)', padding: 16, overflowY: 'auto', flexShrink: 0 }}>
          <h4 style={{ color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 700, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Properties</h4>

          {/* Tool hint */}
          {activeTool !== 'select' && (
            <div style={{ color: '#94a3b8', fontSize: '0.78rem', padding: '10px 12px', background: 'rgba(139,92,246,0.1)', borderRadius: 8, border: '1px solid rgba(139,92,246,0.2)', marginBottom: 14 }}>
              {activeTool === 'text' && '💡 Click on the PDF to add text'}
              {activeTool === 'highlight' && '💡 Click and drag to highlight'}
              {activeTool === 'draw' && '💡 Click and drag to draw'}
              {activeTool === 'crop' && '💡 Drag the crop box, then Apply'}
              {activeTool === 'image' && '💡 Choose an image to insert'}
              {activeTool === 'sign' && '💡 Draw your signature'}
            </div>
          )}

          {/* Text tool properties */}
          {activeTool === 'text' && (
            <div style={{ marginBottom: 16 }}>
              <label style={LABEL}>Font</label>
              <select value={textProps.fontFamily} onChange={e => setTextProps(p => ({ ...p, fontFamily: e.target.value }))} style={SELECT}>
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <label style={LABEL}>Size</label>
              <select value={textProps.fontSize} onChange={e => setTextProps(p => ({ ...p, fontSize: Number(e.target.value) }))} style={SELECT}>
                {FONT_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
              </select>
              <label style={LABEL}>Color</label>
              <input type="color" value={textProps.color} onChange={e => setTextProps(p => ({ ...p, color: e.target.value }))}
                style={{ width: '100%', height: 32, borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', marginBottom: 8 }} />
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setTextProps(p => ({ ...p, fontWeight: p.fontWeight === 'bold' ? 'normal' : 'bold' }))}
                  style={{ ...ICON_BTN, flex: 1, fontWeight: 700, background: textProps.fontWeight === 'bold' ? 'rgba(139,92,246,0.3)' : undefined }}>B</button>
                <button onClick={() => setTextProps(p => ({ ...p, fontStyle: p.fontStyle === 'italic' ? 'normal' : 'italic' }))}
                  style={{ ...ICON_BTN, flex: 1, fontStyle: 'italic', background: textProps.fontStyle === 'italic' ? 'rgba(139,92,246,0.3)' : undefined }}>I</button>
              </div>
            </div>
          )}

          {/* Selected annotation properties */}
          {editingId && (() => {
            const a = annotations.find(x => x.id === editingId)
            if (!a) return null
            return (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selected: {a.type}</div>
                {a.type === 'text' && (
                  <>
                    <label style={LABEL}>Text</label>
                    <input value={a.text} onChange={e => updateAnnotation(a.id, 'text', e.target.value)} style={INPUT} />
                    <label style={LABEL}>Font Size</label>
                    <input type="number" min={8} max={72} value={a.fontSize} onChange={e => updateAnnotation(a.id, 'fontSize', Number(e.target.value))} style={INPUT} />
                    <label style={LABEL}>Color</label>
                    <input type="color" value={a.color} onChange={e => updateAnnotation(a.id, 'color', e.target.value)}
                      style={{ width: '100%', height: 32, borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', marginBottom: 8 }} />
                    <label style={LABEL}>Font</label>
                    <select value={a.fontFamily} onChange={e => updateAnnotation(a.id, 'fontFamily', e.target.value)} style={SELECT}>
                      {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </>
                )}
                {a.type === 'highlight' && (
                  <>
                    <label style={LABEL}>Highlight Color</label>
                    <input type="color" value={a.color} onChange={e => updateAnnotation(a.id, 'color', e.target.value)}
                      style={{ width: '100%', height: 32, borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', marginBottom: 8 }} />
                  </>
                )}
                {a.type === 'draw' && (
                  <>
                    <label style={LABEL}>Stroke Color</label>
                    <input type="color" value={a.color} onChange={e => updateAnnotation(a.id, 'color', e.target.value)}
                      style={{ width: '100%', height: 32, borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', marginBottom: 8 }} />
                  </>
                )}
                <button onClick={() => deleteAnnotation(a.id)}
                  style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', cursor: 'pointer', fontSize: '0.8rem', marginTop: 4 }}>
                  🗑️ Delete
                </button>
              </div>
            )
          })()}

          {/* Page navigation */}
          <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Navigation</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1} style={ICON_BTN}>‹</button>
              <span style={{ color: '#e2e8f0', fontSize: '0.82rem', flex: 1, textAlign: 'center' }}>{currentPage} / {numPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))} disabled={currentPage >= numPages} style={ICON_BTN}>›</button>
            </div>
          </div>

          {/* Annotation count */}
          <div style={{ marginTop: 12, padding: '8px 10px', background: 'rgba(139,92,246,0.08)', borderRadius: 6, border: '1px solid rgba(139,92,246,0.15)' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Annotations</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#c4b5fd' }}>{annotations.length}</div>
          </div>
        </div>
      </div>

      {/* ── Status bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '5px 16px', background: 'rgba(10,15,30,0.95)', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.72rem', color: '#64748b', flexShrink: 0 }}>
        <span style={{ color: '#94a3b8' }}>📄 {file?.name}</span>
        <span>Page {currentPage} of {numPages}</span>
        <span>{scalePercent}%</span>
        <span>{annotations.length} annotation{annotations.length !== 1 ? 's' : ''}</span>
        {currentCrop && <span style={{ color: '#a78bfa' }}>✂ Crop on page {currentPage}</span>}
        <span style={{ marginLeft: 'auto', color: '#a78bfa', fontWeight: 600 }}>
          {TOOLS.find(t => t.id === activeTool)?.icon} {TOOLS.find(t => t.id === activeTool)?.label}
        </span>
      </div>

      {/* ── Signature pad modal ── */}
      {showSignPad && <SignaturePad onDone={handleSignatureDone} onCancel={() => setShowSignPad(false)} />}

      {/* Hidden image input */}
      <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
    </div>
  )
}

// ─── Inline style helpers ─────────────────────────────────────────────────────
const LABEL = { fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }
const INPUT = { width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: '0.82rem', boxSizing: 'border-box', marginBottom: 8, outline: 'none' }
const SELECT = { width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.8)', color: '#e2e8f0', fontSize: '0.82rem', boxSizing: 'border-box', marginBottom: 8, cursor: 'pointer', outline: 'none' }

