"use client"

import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "./AuthProvider"
import LoadingScreen from "@/components/layout/loading"

export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingScreen/>
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
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
    console.log("Access denied: User role not in allowed roles")
    return <Navigate to="/403" replace />
  }

  console.log("Access granted")
  return children
}

