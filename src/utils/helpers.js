export const formatBytes = (bytes, decimals = 1) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export const isPDF = (file) => file?.type === 'application/pdf' || file?.name?.endsWith('.pdf')
export const isImage = (file) => file?.type?.startsWith('image/')

export const getFileIcon = (name = '') => {
  const ext = name.split('.').pop()?.toLowerCase()
  const map = { pdf: '📄', jpg: '🖼️', jpeg: '🖼️', png: '🖼️', webp: '🖼️', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊' }
  return map[ext] || '📁'
}

export const getOperationLabel = (op) => {
  const labels = {
    merge: 'Merge PDF', split: 'Split PDF', compress: 'Compress PDF',
    rotate: 'Rotate PDF', watermark: 'Add Watermark', protect: 'Protect PDF',
    unlock: 'Unlock PDF', reorder: 'Reorder Pages',
    'pdf-to-jpg': 'PDF to JPG', 'jpg-to-pdf': 'JPG to PDF',
    'pdf-to-word': 'PDF to Word', 'word-to-pdf': 'Word to PDF',
    'extract-text': 'Extract Text', 'info': 'PDF Info'
  }
  return labels[op] || op
}

export const downloadFile = (url, filename) => {
  let downloadUrl = url

  // Force https — Render returns http URLs which browsers block as insecure
  if (downloadUrl && downloadUrl.startsWith('http://')) {
    downloadUrl = downloadUrl.replace('http://', 'https://')
  }

  // If it's a Cloudinary URL, inject fl_attachment to force download
  if (downloadUrl.includes('cloudinary.com') && !downloadUrl.includes('fl_attachment')) {
    if (downloadUrl.includes('/upload/')) {
      downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/')
    } else if (downloadUrl.includes('/raw/upload/')) {
      downloadUrl = downloadUrl.replace('/raw/upload/', '/raw/upload/fl_attachment/')
    }
  }

  const a = document.createElement('a')
  a.href = downloadUrl
  a.download = filename || 'download'
  a.target = '_blank'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

