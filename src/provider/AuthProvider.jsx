"use client"

/* eslint-disable indent */
import { ENDPOINTS, ROLES } from "@/lib/constants"
import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

const AuthContext = createContext()

const notCallRotateTokenEndpoints = [ENDPOINTS.ROTATE_TOKEN, ENDPOINTS.POST_LOGOUT, ENDPOINTS.POST_LOGIN]

// Add a list of endpoints that should not redirect to error pages
const noRedirectToErrorEndpoints = [
  ENDPOINTS.GET_INFOR,
  ENDPOINTS.POST_LOGIN,
  ENDPOINTS.ROTATE_TOKEN,
  ENDPOINTS.POST_LOGOUT,
  ENDPOINTS.CREATE_LESSON,
  ENDPOINTS.UPDATE_LESSON,
  ENDPOINTS.DOWNLOAD_FILE_LESSON
]

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
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
        if (data.role === ROLES.STUDENT) {
          logout(true)
        }
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

  const logout = async (redirect = false, redirectPath = true) => {
    try {
      await apiCall(ENDPOINTS.POST_LOGOUT, {
        method: "POST"
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsAuthenticated(false)
      setUser(null)
      location.state = null
      if (redirect) {
        if (redirectPath) {
          navigate("/login", { state: { loginRequire: true, redirectPath: window.location.pathname } })
        } else {
          navigate("/login")
        }
      }
    }
  }

  const login = async (credentials) => {
    try {
      const response = await fetch(ENDPOINTS.POST_LOGIN, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": ENDPOINTS.FRONTEND,
          "Access-Control-Allow-Credentials": "true"
        },
        body: JSON.stringify(credentials)
      })

      if (response.ok) {
        await checkAuthStatus()
        return { success: true }
      } else {
        return { success: false, error: await response.json() }
      }
    } catch (error) {
      console.error("Login failed:", error)
      return { success: false, error }
    }
  }

  // Add a login function to ensure both states are set properly:
  const loginGoogle = async (credentials) => {
    try {
      const response = await fetch(ENDPOINTS.LOGIN_GOOGLE + "?token=" + credentials, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://localhost:5174",
          "Access-Control-Allow-Credentials": "true"
        },
        body: JSON.stringify(credentials)
      })

      if (response.ok) {
        // After successful login, immediately check auth status to get user data
        await checkAuthStatus()
        return { success: true }
      } else {
        return { success: false, error: await response.json() }
      }
    } catch (error) {
      console.error("Login failed:", error)
      return { success: false, error }
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

      // if (response.status === 403) {
      //   navigate("/403")
      //   return
      // }

      if (response.status === 400 || response.status === 500) {
        let errorMessage = "Error. Waring when call api: " + url
        console.warn(errorMessage)
        return response
      }

      // Check if this endpoint should skip error redirects
      const shouldSkipErrorRedirect = noRedirectToErrorEndpoints.some((endpoint) => {
        const endpointPattern = endpoint
          .replace(/:[a-zA-Z0-9_]+/g, "[^/]+")
          .replace(/\?/g, "\\?")
          .replace(/=/g, "=")
          .replace(/&/g, "&")

        const regex = new RegExp(`^${endpointPattern}($|\\?.*)`)
        return regex.test(url)
      })

      if (response.status === 401 && !notCallRotateTokenEndpoints.includes(url)) {
        const status = await refreshAccessToken(redirect)

        if (status === 200) {
          // Try the original request again after token refresh
          response = await fetch(url, options)
          return response
        } else {
          // Handle different error statuses, but only if not in the noRedirect list
          if (!shouldSkipErrorRedirect) {
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
              // default:
              //   navigate("/500")
            }
          }
          return response
        }
      } else {
        // Handle other error statuses, but only if not in the noRedirect list
        if (!shouldSkipErrorRedirect) {
          switch (response.status) {
            case 403:
              navigate("/403")
              break
            case 404:
              navigate("/404")
              break
            // default:
            //   if (response.status >= 500) {
            //     navigate("/500")
            //   }
          }
        }
        return response
      }
    } catch (error) {
      console.warn("API call error:", error)

      // Check if this endpoint should skip error redirects for network errors
      const shouldSkipErrorRedirect = noRedirectToErrorEndpoints.some(
        (endpoint) => url === endpoint || url.startsWith(endpoint)
      )

      // Only navigate to error page if not in the noRedirect list
      if (!shouldSkipErrorRedirect) {
        navigate("/500")
      }

      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        apiCall,
        logout,
        login,
        loginGoogle,
        isAuthenticated,
        user,
        isLoading,
        setIsAuthenticated,
        checkAuthStatus
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

