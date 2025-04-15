"use client"

import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "./AuthProvider"
import LoadingScreen from "@/components/layout/loading"
import { use } from "marked"

export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, user, isLoading, logout } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingScreen/>
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    logout()
    return (
      <Navigate
        to="/login"
        state={{
          loginRequire: true,
          redirectPath: location.pathname
        }}
        replace
      />
    )
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log(user.role)
    console.error("Access denied: User role not in allowed roles")
    return <Navigate to="/403" replace />
  }

  console.log("Access granted")
  return children
}

