"use client"

/* eslint-disable indent */
import { ENDPOINTS } from "@/lib/constants"
import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const AuthContext = createContext()

const notCallRotateTokenEndpoints = [ENDPOINTS.ROTATE_TOKEN, ENDPOINTS.POST_LOGOUT, ENDPOINTS.POST_LOGIN]

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true) // Add loading state
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshPromise, setRefreshPromise] = useState(null)

  const checkAuthStatus = async () => {
    setIsLoading(true)
    try {
      const response = await apiCall(ENDPOINTS.GET_INFOR)
      if (response && response.ok) {
        const data = await response.json()
        setIsAuthenticated(true)
        setUser(data)
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const logout = async (redirect = false) => {
    try {
      await apiCall(ENDPOINTS.POST_LOGOUT, {
        method: "POST"
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsAuthenticated(false)
      setUser(null)
      if (redirect) navigate("/login", { state: { loginRequire: true, redirectPath: window.location.pathname } })
    }
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
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Token refresh failed with status: ${response.status}`)
        }
        return 200
      })
      .catch((error) => {
        console.error("Refresh token failed:", error)
        logout(redirect)
        return error.message.includes("401") ? 401 : 500
      })
      .finally(() => {
        setIsRefreshing(false)
        setRefreshPromise(null)
      })

    setRefreshPromise(promise)
    return promise // Return the actual promise instead of always 200
  }

  const apiCall = async (url, options = {}, redirect = false) => {
    if (!options.headers) {
      options.headers = {}
    }

    options.headers = {
      ...(options.headers || {}),
      "Access-Control-Allow-Origin": ENDPOINTS.FRONTEND,
      "Access-Control-Allow-Credentials": "true"
    }
    options.credentials = "include"

    try {
      let response = await fetch(url, options)

      if (response.ok) {
        return response
      }

      if (response.status === 401 && !notCallRotateTokenEndpoints.includes(url)) {
        console.warn("Access token expired. Attempting refresh...")

        const status = await refreshAccessToken(redirect)

        if (status === 200) {
          // Try the original request again after token refresh
          response = await fetch(url, options)
          return response
        } else {
          // Handle different error statuses
          switch (status) {
            case 401:
              navigate("/401")
              break
            case 403:
              navigate("/403")
              break
            case 404:
              navigate("/404")
              break
            default:
              navigate("/500")
          }
          return response // Return the response even in error cases
        }
      } else {
        // Handle other error statuses
        switch (response.status) {
          case 403:
            navigate("/403")
            break
          case 404:
            navigate("/404")
            break
          default:
            if (response.status >= 500) {
              navigate("/500")
            }
        }
        return response // Return the response
      }
    } catch (error) {
      console.warn("API call error:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        apiCall,
        logout,
        isAuthenticated,
        user,
        isLoading, // Expose loading state
        setIsAuthenticated,
        checkAuthStatus // Expose this so it can be called after login
      }}
    >
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

