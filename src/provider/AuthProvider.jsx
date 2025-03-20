/* eslint-disable indent */
import { ENDPOINTS } from "@/lib/constants"
import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const AuthContext = createContext()

const notCallRotateTokenEndpoints = [
  ENDPOINTS.ROTATE_TOKEN,
  ENDPOINTS.POST_LOGOUT,
  ENDPOINTS.POST_LOGIN
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
          return response.status
        }
        return 200
      })
      .catch(error => {
        console.error("Refresh token failed:", error)
        logout(redirect)
        return 500
      })
      .finally(() => {
        setIsRefreshing(false)
        setRefreshPromise(null)
      })

    setRefreshPromise(promise)
    return 200
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
      // console.log("check", url, !notCallRotateTokenEndpoints.includes(url))
      if (response.status === 401 && !notCallRotateTokenEndpoints.includes(url)) {
        console.warn("Access token expired. Attempting refresh...")

        const status = await refreshAccessToken(redirect)

        if (status == 200) {
          response = await fetch(url, options)
        } else {
          console.log(url, status)
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
        }
      }

      else {
        console.log(url, response.status)
        switch (response.status) {
          case 403:
            navigate("/403")
            break
          case 404:
            navigate("/404")
            break
          default:
            navigate("/500")
        }
      }
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
