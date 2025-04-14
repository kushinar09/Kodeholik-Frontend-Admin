import { ENDPOINTS } from "@/lib/constants"

export async function getListTagForAdmin(apiCall, body) {
  const url = `${ENDPOINTS.POST_TAG_LIST_FOR_ADMIN}`
  const response = await apiCall(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })
  if (!response.ok) {
    const errorData = await response.json()
    let errorMessage = "Failed to fetch tag list"

    if (Array.isArray(errorData.message)) {
      errorMessage = errorData.message[0]?.error || errorMessage
    } else if (typeof errorData.message === "object") {
      errorMessage = errorData.message.error || errorMessage
    } else if (typeof errorData.message === "string") {
      errorMessage = errorData.message
    }
    throw new Error(errorMessage)
  }
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}

export async function deleteTag(apiCall, id, type) {
  const url = `${ENDPOINTS.DELETE_TAG}${id}?tagType=${type}`
  const response = await apiCall(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    }
  })
  if (!response.ok) {
    const errorData = await response.json()
    let errorMessage = "Failed to delete tag"

    if (Array.isArray(errorData.message)) {
      errorMessage = errorData.message[0]?.error || errorMessage
    } else if (typeof errorData.message === "object") {
      errorMessage = errorData.message.error || errorMessage
    } else if (typeof errorData.message === "string") {
      errorMessage = errorData.message
    }
    throw new Error(errorMessage)
  }
}

export async function addTag(apiCall, body) {
  const url = `${ENDPOINTS.ADD_TAG}`
  const response = await apiCall(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })
  if (!response.ok) {
    const errorData = await response.json()
    let errorMessage = "Failed to add tag"

    if (Array.isArray(errorData.message)) {
      errorMessage = errorData.message[0]?.error || errorMessage
    } else if (typeof errorData.message === "object") {
      errorMessage = errorData.message.error || errorMessage
    } else if (typeof errorData.message === "string") {
      errorMessage = errorData.message
    }
    throw new Error(errorMessage)
  }
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}

export async function editTag(apiCall, body, id) {
  const url = `${ENDPOINTS.EDIT_TAG}${id}`
  const response = await apiCall(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })
  if (!response.ok) {
    const errorData = await response.json()
    let errorMessage = "Failed to edit tag"

    if (Array.isArray(errorData.message)) {
      errorMessage = errorData.message[0]?.error || errorMessage
    } else if (typeof errorData.message === "object") {
      errorMessage = errorData.message.error || errorMessage
    } else if (typeof errorData.message === "string") {
      errorMessage = errorData.message
    }
    throw new Error(errorMessage)
  }
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}