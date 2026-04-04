import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { formatBytes, getFileIcon } from '../utils/helpers'

export default function DropZone({ onFiles, accept, multiple = false, files = [], onRemove, label, hint }) {
  const onDrop = useCallback((accepted) => {
    onFiles(accepted)
  }, [onFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept, multiple, noClick: false
  })

  return (
    <div>
      <div {...getRootProps()} className={`drop-zone${isDragActive ? ' drag-active' : ''}`}>
        <input {...getInputProps()} />
        <div className="drop-zone-icon">{isDragActive ? '📂' : '📤'}</div>
        <h3>{isDragActive ? 'Drop files here!' : (label || 'Click or drag & drop files here')}</h3>
        <p>{hint || 'Supports PDF files up to 50MB'}</p>
        <div style={{ marginTop: 16 }}>
          <button type="button" className="btn btn-primary btn-sm" onClick={e => e.stopPropagation()}>
            Choose Files
          </button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="file-list">
          {files.map((file, i) => (
            <div key={i} className="file-item">
              <span className="file-item-icon">{getFileIcon(file.name)}</span>
              <div className="file-item-info">
                <div className="file-item-name">{file.name}</div>
                <div className="file-item-size">{formatBytes(file.size)}</div>
              </div>
              {onRemove && (
                <button className="file-item-remove" onClick={() => onRemove(i)} title="Remove">✕</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
