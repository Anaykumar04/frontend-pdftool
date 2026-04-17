import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

const API = api // Use the central api instance

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('pdf_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`
      API.get('/auth/me')
        .then(res => setUser(res.data.user))
        .catch(() => { localStorage.removeItem('pdf_token'); setToken(null) })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password })
    const { token: t, user: u } = res.data
    localStorage.setItem('pdf_token', t)
    API.defaults.headers.common['Authorization'] = `Bearer ${t}`
    setToken(t); setUser(u)
    return u
  }

  const register = async (name, email, password) => {
    const res = await API.post('/auth/register', { name, email, password })
    const { token: t, user: u } = res.data
    localStorage.setItem('pdf_token', t)
    API.defaults.headers.common['Authorization'] = `Bearer ${t}`
    setToken(t); setUser(u)
    return u
  }

  const logout = () => {
    localStorage.removeItem('pdf_token')
    delete API.defaults.headers.common['Authorization']
    setToken(null); setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
export { API }
