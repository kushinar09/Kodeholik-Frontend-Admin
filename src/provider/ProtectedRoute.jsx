import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "./AuthProvider"
import LoadingScreen from "@/components/layout/loading"

const ProtectedRoute = () => {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) return <LoadingScreen />

  return isAuthenticated && user ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute