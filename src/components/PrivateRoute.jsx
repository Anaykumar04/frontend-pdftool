import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute({ children, adminOnly }) {
  const { isAuth, loading, user } = useAuth()
  if (loading) return (
    <div className="loading-overlay" style={{ minHeight: '60vh' }}>
      <div className="spinner" />
      <span className="loading-text">Loading...</span>
    </div>
  )
  
  if (!isAuth) return <Navigate to="/login" replace />
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/profile" replace />
  
  return children
}
