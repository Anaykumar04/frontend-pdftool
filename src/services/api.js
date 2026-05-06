import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://backend-pdftool.onrender.com/api',
  timeout: 120000, // 2 min for large files
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('pdf_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    let msg = 'Something went wrong'
    if (err.response?.data?.error) {
      msg = typeof err.response.data.error === 'string' ? err.response.data.error : JSON.stringify(err.response.data.error)
    } else if (err.message) {
      msg = err.message
    }
    return Promise.reject(new Error(msg))
  }
)

// PDF operations
export const pdfApi = {
  merge: (files, onProgress) => {
    const form = new FormData()
    files.forEach(f => form.append('files', f))
    return api.post('/pdf/merge', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    })
  },
  split: (file, splitMode, ranges, onProgress) => {
    const form = new FormData()
    form.append('file', file)
    form.append('splitMode', splitMode)
    if (ranges) form.append('ranges', JSON.stringify(ranges))
    return api.post('/pdf/split', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    })
  },
  compress: (file, onProgress) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/pdf/compress', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    })
  },
  rotate: (file, rotation, pages, onProgress) => {
    const form = new FormData()
    form.append('file', file)
    form.append('rotation', rotation)
    form.append('pages', pages)
    return api.post('/pdf/rotate', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    })
  },
  watermark: (file, text, opacity, fontSize, color, onProgress) => {
    const form = new FormData()
    form.append('file', file)
    form.append('text', text)
    form.append('opacity', opacity)
    form.append('fontSize', fontSize)
    form.append('color', color)
    return api.post('/pdf/watermark', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    })
  },
  protect: (file, title, onProgress) => {
    const form = new FormData()
    form.append('file', file)
    form.append('title', title)
    return api.post('/pdf/protect', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    })
  },
  reorder: (file, order, onProgress) => {
    const form = new FormData()
    form.append('file', file)
    form.append('order', JSON.stringify(order))
    return api.post('/pdf/reorder', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    })
  },
  info: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/pdf/info', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  imageToPdf: (files, onProgress) => {
    const form = new FormData()
    files.forEach(f => form.append('files', f))
    return api.post('/pdf/image-to-pdf', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    })
  },
  extractText: (file, onProgress) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/pdf/extract-text', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    })
  },
  wordToPdf: (file, onProgress) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/pdf/word-to-pdf', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    })
  },
  pageNumbers: (file, position, fontSize, onProgress) => {
    const form = new FormData()
    form.append('file', file)
    form.append('position', position)
    form.append('fontSize', fontSize)
    return api.post('/pdf/page-numbers', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    })
  },
  deletePages: (file, pages, onProgress) => {
    const form = new FormData()
    form.append('file', file)
    form.append('pages', JSON.stringify(pages))
    return api.post('/pdf/delete-pages', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    })
  },
  addStamp: (file, text, color, onProgress) => {
    const form = new FormData()
    form.append('file', file)
    form.append('text', text)
    form.append('color', color)
    return api.post('/pdf/add-stamp', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    })
  },
  signImage: (pdf, signatureBlob, position, onProgress) => {
    const form = new FormData()
    form.append('pdf', pdf)
    form.append('signature', signatureBlob, 'signature.png')
    form.append('position', position)
    return api.post('/pdf/sign-image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    })
  },
  detectFields: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/pdf/detect-fields', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  fillForm: (file, data, onProgress) => {
    const form = new FormData()
    form.append('file', file)
    form.append('data', JSON.stringify(data))
    return api.post('/pdf/fill-form', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    })
  },
  pdfToJpg: (file, onProgress) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/pdf/pdf-to-jpg', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    })
  },
  removeBlankPages: (file, onProgress) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/pdf/remove-blank-pages', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    })
  },
  flattenPdf: (file, onProgress) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/pdf/flatten-pdf', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    })
  },
  repairPdf: (file, onProgress) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/pdf/repair-pdf', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    })
  },
  headerFooter: (file, header, footer, fontSize, onProgress) => {
    const form = new FormData()
    form.append('file', file)
    form.append('header', header)
    form.append('footer', footer)
    form.append('fontSize', fontSize)
    return api.post('/pdf/header-footer', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    })
  },
  cropPdf: (file, top, bottom, left, right, onProgress) => {
    const form = new FormData()
    form.append('file', file)
    form.append('top', top)
    form.append('bottom', bottom)
    form.append('left', left)
    form.append('right', right)
    return api.post('/pdf/crop-pdf', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    })
  }
}

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  me: () => api.get('/auth/me')
}

export const historyApi = {
  get: () => api.get('/history'),
  delete: (id) => api.delete(`/history/${id}`)
}

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  deleteHistory: (id) => api.delete(`/admin/history/${id}`),
}

export default api

