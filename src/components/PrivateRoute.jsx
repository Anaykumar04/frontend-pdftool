import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute({ children }) {
  const { isAuth, loading } = useAuth()
  if (loading) return (
    <div className="loading-overlay" style={{ minHeight: '60vh' }}>
      <div className="spinner" />
      <span className="loading-text">Loading...</span>
    </div>
  )
  return isAuth ? children : <Navigate to="/login" replace />
}
