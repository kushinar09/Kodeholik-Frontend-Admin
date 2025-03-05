import { ENDPOINTS } from "@/lib/constants"
import { MESSAGES } from "../messages"

// reset
export async function requestResetPassword(email) {
  try {
    const response = await fetch(ENDPOINTS.POST_FORGOT_PASSWORD.replace(":gmail", email), {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    })

    if (response.ok) {
      return { status: true }
    } else if (response.status === 400) {
      return { status: false, field: "email" }
    } else {
      return { status: false }
    }
  } catch (error) {
    return { status: false, field: "email", message: error instanceof Error ? error.message : "An unexpected error occurred" }
  }
}

export async function validateResetToken(token) {
  if (!token) return { valid: false }

  try {
    const response = await fetch(ENDPOINTS.GET_CHECK_RESET_TOKEN.replace(":token", token), {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })

    if (response.ok) {
      return { valid: true }
    }

    if (response.status === 401) {
      return { valid: false, expired: true }
    }

    return { valid: false }
  } catch (error) {
    return { valid: false }
  }
}

export async function resetPassword(token, password) {
  if (!token) throw new Error("No token provided")

  try {
    const response = await fetch(ENDPOINTS.POST_RESET_PASSWORD.replace(":token", token), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: password
    })

    if (!response.ok) {
      throw new Error("Failed to reset password")
    }

    return { success: true }
  } catch (error) {
    throw new Error(error.message)
  }
}

// login
export async function login(formData) {
  try {
    const response = await fetch(ENDPOINTS.POST_LOGIN, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    })

    if (response.status === 204) {
      return { status: true }
    } else if (response.status === 401) {
      return { status: false, error: MESSAGES["MSG03"].content }
    } else if (response.status === 400) {
      return { status: false, error: MESSAGES["MSG01"].content }
    } else {
      return { status: false, error: "Network error. Please try again later." }
    }
  } catch (error) {
    throw new Error("Login failed. Please check your credentials and try again.")
  }
}

export async function getInfor() {
  try {
    const response = await fetch(ENDPOINTS.GET_INFOR, {
      method: "POST",
      credentials: "include",
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:5174",
        "Access-Control-Allow-Credentials": "true",
        "Content-Type": "application/json"
      }
    })

    if (response.status === 204) {
      return { status: true }
    } else if (response.status === 401) {
      return { status: false, error: MESSAGES["MSG03"].content }
    } else if (response.status === 400) {
      return { status: false, error: MESSAGES["MSG01"].content }
    } else {
      return { status: false, error: "Network error. Please try again later." }
    }
  } catch (error) {
    throw new Error("Login failed. Please check your credentials and try again.")
  }
}

export const loginWithGoogle = () => {
  window.location.href = ENDPOINTS.LOGIN_GOOGLE
}

export const loginWithGithub = () => {
  window.location.href = ENDPOINTS.LOGIN_GITHUB
}
