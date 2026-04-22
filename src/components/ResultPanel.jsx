import { formatBytes, downloadFile } from '../utils/helpers'
import { FiDownload, FiRefreshCw, FiShare2, FiClock, FiFileText } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function ResultPanel({ result, onReset, extraInfo }) {
  if (!result) return null
  const isArray = Array.isArray(result.outputs)

  const handleShare = () => {
    const fileUrl = isArray ? result.outputs[0].url : result.output.url;
    // If it's a Cloudinary URL, use it directly. Otherwise use local fallback.
    const shareUrl = fileUrl.startsWith('http') ? fileUrl : `${window.location.origin}${fileUrl}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Download link copied to clipboard!');
  }

  return (
    <div className="result-panel animate-fade-up">
      <div className="result-header">
        <div className="result-icon-success">✅</div>
        <h2 className="gradient-text">{result.message || 'Operation Successful!'}</h2>
        {extraInfo && <p className="result-subtitle">{extraInfo}</p>}
      </div>

      <div className="result-info-grid">
        {result.processingTime && (
          <div className="result-info-item">
            <FiClock size={16} />
            <span>Processed in <strong>{(result.processingTime / 1000).toFixed(1)}s</strong></span>
          </div>
        )}
        {!isArray && result.output?.size && (
          <div className="result-info-item">
            <FiFileText size={16} />
            <span>Final size: <strong>{formatBytes(result.output.size)}</strong></span>
          </div>
        )}
      </div>

      <div className="result-actions">
        {!isArray && result.output && (
          <button className="btn btn-primary btn-lg" onClick={() => downloadFile(result.output.url, result.output.filename)}>
            <FiDownload /> Download PDF
          </button>
        )}
        
        {isArray && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' }}>
            {result.outputs?.map((o, i) => (
              <button key={i} className="btn btn-outline btn-sm"
                onClick={() => downloadFile(o.url, o.filename)}
                style={{ justifyContent: 'center' }}>
                <FiDownload /> {o.range ? `Pages ${o.range}` : `Page ${o.page}`}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, width: '100%', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={handleShare}>
              <FiShare2 /> Copy Link
            </button>
            <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={onReset}>
              <FiRefreshCw /> Start Over
            </button>
          </div>
          
          {!isArray && result.output?.url && (
            <div className="result-url-box">
              <span className="result-url-text" style={{ fontSize: '0.75rem' }}>
                {result.output.url.startsWith('http') ? result.output.url : `${window.location.origin}${result.output.url}`}
              </span>
              <button className="btn-copy-sm" onClick={handleShare}>Copy</button>
            </div>
          )}
        </div>
      </div>

      <div className="result-footer">
        <p>Files are stored securely and will be automatically deleted in 60 minutes.</p>
      </div>
    </div>
  )
}
