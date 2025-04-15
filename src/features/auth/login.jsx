"use client"

import { useEffect } from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useLocation, useNavigate } from "react-router-dom"
import { LOGO } from "@/lib/constants"
import { MESSAGES } from "@/lib/messages"
import { loginWithGoogle } from "@/lib/api/auth_api"
import { useAuth } from "@/provider/AuthProvider"
import LoadingScreen from "@/components/layout/loading"
import { toast } from "sonner"

export default function LoginPage() {
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  })

  const { isAuthenticated, login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = location.state?.redirectPath || "/"
      navigate(redirectPath, { replace: true })
    }
    setLoading(false)
  }, [isAuthenticated, location, navigate])

  useEffect(() => {
    if (location.state?.sendEmail) {
      toast.success("Success.", {
        description: "Password reset link has been sent to your email."
      })
    }

    if (location.state?.resetSuccess) {
      toast.success("Success", {
        description: "Your password has been reset successfully. You can now log in with your new password."
      })
    }

    if (location.state?.loginRequire) {
      toast.info("Login Required", {
        description: "You need to be logged in to continue."
      })
    }
  }, [location])

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }))

    if (errors[id]) {
      setErrors((prev) => ({
        ...prev,
        [id]: undefined
      }))
    }
  }

  const handleLoginSubmit = async (e) => {
    console.log("handleLoginSubmit")
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const newErrors = {}

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

      if (!emailRegex.test(formData.username)) {
        newErrors.username = "Please enter a valid email"
      }

      if (formData.username.trim().length === 0) {
        newErrors.username = MESSAGES["MSG02"].content
      }

      if (formData.password.trim().length === 0) {
        newErrors.password = MESSAGES["MSG02"].content
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
      } else {
        const result = await login(formData)
        if (!result.success) {
          if (result.error.message) {
            newErrors.general = result.error.message
          } else {
            throw new Error("Login failed. Please check your username/password and try again.")
          }
        } else {
          const redirectPath = location.state?.redirectPath || "/"
          navigate(redirectPath)
          location.state = null
        }
        setErrors(newErrors)
      }
    } catch (error) {
      if (!errors.general && !Object.keys(errors).length) {
        setErrors({ general: error.message })
      }
    } finally {
      setLoading(false)
    }
  }

  function handleLoginGoogle() {
    loginWithGoogle()
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {loading && <LoadingScreen loadingText="Loading..." />}
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-white dark:bg-primary">
        <div className="w-fit flex justify-center gap-2 md:justify-start bg-black dark:bg-white p-2 py-1 rounded-md">
          <a href="/" className="flex items-center gap-2 font-medium text-white dark:text-black">
            <div className="flex h-8 w-8 items-center justify-center rounded-md">
              <LOGO className="size-8" />
            </div>
            Kodeholik.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <form className={cn("flex flex-col gap-6")} onSubmit={handleLoginSubmit}>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold text-black dark:text-white">Login to your account</h1>
                {errors.general && <p className="text-sm font-medium text-red-500">{errors.general}</p>}
              </div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label
                    htmlFor="username"
                    className={cn("text-black dark:text-white", errors.username && "text-red-500")}
                  >
                    Email
                  </Label>
                  <Input
                    className={cn(
                      "border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white placeholder-gray-400 dark:placeholder-gray-600 text-black dark:text-white bg-white dark:bg-black",
                      errors.username && "border-red-500 focus:border-red-500"
                    )}
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="m@example.com"
                    disabled={loading}
                  />
                  {errors.username && <p className="text-sm font-medium text-red-500">{errors.username}</p>}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label
                      htmlFor="password"
                      className={cn("text-black dark:text-white", errors.password && "text-red-500")}
                    >
                      Password
                    </Label>
                  </div>
                  <Input
                    className={cn(
                      "border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white placeholder-gray-400 dark:placeholder-gray-600 text-black dark:text-white bg-white dark:bg-black",
                      errors.password && "border-red-500 focus:border-red-500"
                    )}
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  {errors.password && <p className="text-sm font-medium text-red-500">{errors.password}</p>}
                </div>
                <a
                  href="/forgot"
                  className="ml-auto text-sm text-black dark:text-white hover:underline underline-offset-4"
                >
                  Forgot password?
                </a>
                <Button
                  type="submit"
                  className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  Login
                </Button>
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-gray-300 dark:after:border-gray-700">
                  <span className="relative z-10 bg-white dark:bg-black px-2 text-black dark:text-white">
                    Or continue with
                  </span>
                </div>
                <div className="grid gap-4">
                  <Button
                    type="button"
                    onClick={handleLoginGoogle}
                    variant="outline"
                    className="w-full border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M23.5 12.2C23.5 11.42 23.43 10.68 23.32 9.96H12V14.28H18.58C18.3 15.72 17.52 16.98 16.36 17.86V20.59H20.1C22.24 18.62 23.5 15.72 23.5 12.2Z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 24C15.24 24 17.96 22.92 20.1 20.59L16.36 17.86C15.22 18.68 13.74 19.16 12 19.16C8.9 19.16 6.26 17.02 5.32 14.22H1.45V17.05C3.58 21.02 7.48 24 12 24Z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.32 14.22C5.08 13.4 4.96 12.52 4.96 11.62C4.96 10.72 5.08 9.84 5.32 9.02V6.19H1.45C0.52 8.02 0 9.96 0 11.96C0 13.96 0.52 15.9 1.45 17.73L5.32 14.22Z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 4.84C13.92 4.84 15.56 5.52 16.82 6.73L20.19 3.36C17.96 1.26 15.24 0 12 0C7.48 0 3.58 2.98 1.45 6.95L5.32 9.84C6.26 7.02 8.9 4.84 12 4.84Z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span className="sr-only">Login with Google</span>
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-primary dark:bg-white lg:block">
        <LOGO className="absolute inset-0 h-full w-full object-cover" />
      </div>
    </div>
  )
}

