import { ENDPOINTS } from "../constants"

export async function getChapterList() {
  const response = await fetch(ENDPOINTS.GET_CHAPTERS, {
    method: "GET",
    credentials: "include"
  })
  if (!response.ok) {
    const errorData = await response.json()
    let errorMessage = "Failed to fetch chapter"

    if (Array.isArray(errorData.message)) {
      errorMessage = errorData.message[0]?.error || errorMessage
    } else if (typeof errorData.message === "object") {
      errorMessage = errorData.message.error || errorMessage
    } else if (typeof errorData.message === "string") {
      errorMessage = errorData.message
    }
    throw new Error(errorMessage)
  }
  return response.json()
}

export async function getChapterByCourseId(id) {
  const response = await fetch(ENDPOINTS.GET_CHAPTER_BY_COURSE_ID.replace(":id", id), {
    method: "GET",
    credentials: "include"
  })
  if (!response.ok) {
    const errorData = await response.json()
    let errorMessage = "Failed to fetch chapter"

    if (Array.isArray(errorData.message)) {
      errorMessage = errorData.message[0]?.error || errorMessage
    } else if (typeof errorData.message === "object") {
      errorMessage = errorData.message.error || errorMessage
    } else if (typeof errorData.message === "string") {
      errorMessage = errorData.message
    }
    throw new Error(errorMessage)
  }
  return response.json()
}

export async function getChapter(id) {
  const response = await fetch(ENDPOINTS.GET_CHAPTER_DETAIL.replace(":id", id), {
    method: "GET",
    credentials: "include"
  })
  if (!response.ok) {
    throw new Error("Failed to fetch chapter detail")
  }
  return response.json()
}

export async function createChapter(data, apiCall) {
  const response = await apiCall(ENDPOINTS.CREATE_CHAPTER, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const errorData = await response.json()
    let errorMessage = "Failed to create chapter"

    if (Array.isArray(errorData.message)) {
      errorMessage = errorData.message[0]?.error || errorMessage
    } else if (typeof errorData.message === "object") {
      errorMessage = errorData.message.error || errorMessage
    } else if (typeof errorData.message === "string") {
      errorMessage = errorData.message
    }
    throw new Error(errorMessage)
  }

  // Get the response as text first
  const text = await response.text()

  // Handle the known case where backend returns "1" for success
  if (text.trim() === "1") {
    return { success: true } // Normalize to a success object
  }

  // Attempt to parse as JSON for future-proofing
  try {
    const jsonData = JSON.parse(text)
    return jsonData
  } catch (e) {
    console.warn("Response is not JSON, treating as success:", e.message)
    return { success: true, rawResponse: text }
  }

}

export async function updateChapter(id, data, apiCall) {
  const response = await apiCall(ENDPOINTS.UPDATE_CHAPTER.replace(":id", id), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const errorData = await response.json()
    let errorMessage = `Failed to update chapter: ${response.statusText}`

    if (Array.isArray(errorData.message)) {
      errorMessage = errorData.message[0]?.error || errorMessage
    } else if (typeof errorData.message === "object") {
      errorMessage = errorData.message.error || errorMessage
    } else if (typeof errorData.message === "string") {
      errorMessage = errorData.message
    }
    throw new Error(errorMessage)
  }

  // Get the response as text first
  const text = await response.text()

  // Handle the known case where backend returns "1" for success
  if (text.trim() === "1") {
    return { success: true } // Normalize to a success object
  }

  // Attempt to parse as JSON for future-proofing
  try {
    const jsonData = JSON.parse(text)
    return jsonData
  } catch (jsonError) {
    console.warn("Response is not JSON, treating as success:", text)
    return { success: true, rawResponse: text } // Fallback for non-JSON success
  }
}