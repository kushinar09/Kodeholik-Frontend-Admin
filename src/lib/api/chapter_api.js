import { ENDPOINTS } from "../constants"

export async function getChapterList() {
  const response = await fetch(ENDPOINTS.GET_CHAPTERS, {
    method: "GET",
    credentials: "include"
  })
  if (!response.ok) {
    throw new Error("Failed to fetch chapter")
  }
  return response.json()
}

export async function getChapterByCourseId(id) {
  const response = await fetch(ENDPOINTS.GET_CHAPTER_BY_COURSE_ID.replace(":id", id), {
    method: "GET",
    credentials: "include"
  })
  if (!response.ok) {
    throw new Error("Failed to fetch chapter")
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
  try {
    const response = await apiCall(ENDPOINTS.CREATE_CHAPTER, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorResponse = await response.text() // Use text to avoid JSON parse errors on failure
      throw new Error(`Failed to create chapter: ${errorResponse || response.statusText}`)
    }

    // // Log response details for debugging
    // console.log("Response status:", response.status)
    // console.log("Response headers:", Object.fromEntries(response.headers.entries()))

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
  } catch (error) {
    console.error("Error in createChapter:", {
      error: error.message,
      requestData: data // Log the plain object instead of FormData.entries()
    })
    throw error
  }
}

export async function updateChapter(id, data, apiCall) {
  try {
    const response = await apiCall(ENDPOINTS.UPDATE_CHAPTER.replace(":id", id), {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorResponse = await response.text() // Use text to avoid JSON parse errors on failure
      throw new Error(`Failed to update chapter: ${errorResponse || response.statusText}`)
    }

    // // Log response details for debugging
    // console.log("Response status:", response.status)
    // console.log("Response headers:", Object.fromEntries(response.headers.entries()))

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
  } catch (error) {
    console.error("Error in updateChapter:", {
      error: error.message,
      requestData: data // Log the plain object
    })
    throw error
  }
}