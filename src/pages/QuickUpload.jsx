import { useState } from 'react'
import { API } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiUpload, FiLink, FiDownload, FiCopy, FiCheckCircle } from 'react-icons/fi'

export default function QuickUpload() {
  const [file, setFile] = useState(null)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return
    setFile(selectedFile)
    setLoading(true)
    setProgress(0)

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const res = await API.post('/upload/file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setProgress(percentCompleted)
        }
      })
      setResult(res.data)
      toast.success('File uploaded successfully! 🎉')
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleUrlUpload = async (e) => {
    e.preventDefault()
    if (!url) return toast.error('Please enter a URL')
    setLoading(true)
    try {
      const res = await API.post('/upload/url', { url })
      setResult(res.data)
      toast.success('URL processed and uploaded! 🎉')
    } catch (err) {
      toast.error(err.message || 'URL upload failed')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Link copied to clipboard!')
  }

  const getForceDownloadUrl = (res) => {
    const cloudName = 'dpdfeditor'; // Update with actual cloud name
    const publicId = res.public_id;
    if (res.resource_type === 'raw') {
      return `https://res.cloudinary.com/${cloudName}/raw/upload/fl_attachment/${publicId}`;
    }
    return res.secure_url;
  }

  return (
    <div className="container" style={{ padding: '80px 24px', maxWidth: 800 }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 16 }}>Quick Cloud Upload</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Instantly upload files or URLs to the cloud and get shareable download links.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 24 }}>
        
        {/* Upload Box */}
        {!result && (
          <div className="card-glass" style={{ padding: 40, textAlign: 'center', position: 'relative' }}>
            {loading ? (
              <div style={{ padding: '40px 0' }}>
                <div className="spinner" style={{ margin: '0 auto 20px' }} />
                <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 10 }}>Uploading... {progress}%</div>
                <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-purple)', transition: 'width 0.2s' }} />
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <div>
                  <div style={{ marginBottom: 20, color: 'var(--accent-purple)', fontSize: '3rem' }}><FiUpload /></div>
                  <h3 style={{ marginBottom: 10 }}>Choose a File</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>PDF, Image, or Documents</p>
                  <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                    <FiUpload /> Browse Files
                    <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                </div>

                <div className="auth-divider"><span>OR</span></div>

                <form onSubmit={handleUrlUpload}>
                  <h3 style={{ marginBottom: 10 }}>Paste URL</h3>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input 
                      type="url" 
                      placeholder="https://example.com/file.pdf" 
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn btn-indigo">Upload URL</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="card animate-fade-up" style={{ padding: 40, border: '2px solid var(--accent-green)', background: 'rgba(16, 185, 129, 0.05)' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: '3.5rem', color: 'var(--accent-green)', marginBottom: 16 }}><FiCheckCircle /></div>
              <h2 style={{ marginBottom: 8 }}>Upload Complete!</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Your file is now securely hosted in the cloud.</p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 20, marginBottom: 24, border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' }}>Secure Link</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input readOnly value={result.secure_url} style={{ flex: 1, background: 'transparent', border: 'none', padding: 0 }} />
                <button onClick={() => copyToClipboard(result.secure_url)} className="btn btn-sm btn-ghost" title="Copy link"><FiCopy /></button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href={result.secure_url} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                <FiLink /> Open File
              </a>
              <a href={getForceDownloadUrl(result)} download className="btn btn-indigo" style={{ flex: 1, justifyContent: 'center' }}>
                <FiDownload /> Force Download
              </a>
              <button onClick={() => setResult(null)} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
                Upload Another
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
