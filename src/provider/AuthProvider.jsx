import { CONSTANTS, ENDPOINTS } from "@/lib/constants"
import React, { createContext, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const AuthContext = createContext()

const authenticatedEndpoints = [
  ENDPOINTS.GET_INFOR,
  ENDPOINTS.POST_RUN_CODE,
  ENDPOINTS.POST_SUBMIT_CODE
]

const notCallRotateTokenEndpoints = [
  ENDPOINTS.ROTATE_TOKEN,
  ENDPOINTS.POST_LOGOUT
]

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshPromise, setRefreshPromise] = useState(null)

  const checkAuthStatus = async () => {
    try {
      const response = await apiCall(ENDPOINTS.GET_INFOR)
      if (response.ok) {
        const data = await response.json()
        setIsAuthenticated(true)
        setUser(data)
      } else {
        setIsAuthenticated(false)
      }
    } catch {
      setIsAuthenticated(false)
    }
  }

  useEffect(() => {
    checkAuthStatus()
  }, [isAuthenticated])

  const logout = async (redirect = false) => {
    await apiCall(ENDPOINTS.POST_LOGOUT, {
      method: "POST"
    })
    setIsAuthenticated(false)
    if (redirect)
      navigate("/login", { state: { loginRequire: true, redirectPath: window.location.pathname } })
  }

  const refreshAccessToken = async (redirect) => {
    if (isRefreshing) {
      return refreshPromise
    }

    setIsRefreshing(true)
    const promise = fetch(ENDPOINTS.ROTATE_TOKEN, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to refresh token")
        }
        return true
      })
      .catch(error => {
        console.error("Refresh token failed:", error)
        logout(redirect)
        return false
      })
      .finally(() => {
        setIsRefreshing(false)
        setRefreshPromise(null)
      })

    setRefreshPromise(promise)
    return promise
  }

  const apiCall = async (url, options = {}, redirect = false) => {
    // console.log(window.location.pathname)
    if (!options.headers) {
      options.headers = {}
    }

    options.headers = {
      ...(options.headers || {}),
      "Access-Control-Allow-Origin": "http://localhost:5174",
      "Access-Control-Allow-Credentials": "true"
    }
    options.credentials = "include"

    try {
      let response = await fetch(url, options)

      // console.log("check", url, !notCallRotateTokenEndpoints.includes(url))
      if (response.status === 401 && !notCallRotateTokenEndpoints.includes(url)) {
        console.warn("Access token expired. Attempting refresh...")

        const success = await refreshAccessToken(redirect)

        if (success) {
          response = await fetch(url, options)
        } else {
          throw new Error("Authentication failed")
        }
      }

      return response
    } catch (error) {
      console.warn("API call error:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ apiCall, logout, isAuthenticated, user, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
