import { ENDPOINTS } from "../constants"

export async function getLessonByChapterId(apiCall, id) {
  const response = await apiCall(ENDPOINTS.GET_LESSON_BY_CHAPTERID.replace(":id", id))
  if (!response.ok) {
    const errorData = await response.json()
    let errorMessage = "Failed to fetch lesson"

    if (Array.isArray(errorData.message)) {
      // Extract first error message from array
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

export async function createLesson(formData, apiCall) {
  const response = await apiCall(ENDPOINTS.CREATE_LESSON, {
    method: "POST",
    body: formData
  })
  if (!response.ok) {
    const errorData = await response.json()
    let errorMessage = "Failed to create lesson"

    if (Array.isArray(errorData.message)) {
      // Extract first error message from array
      errorMessage = errorData.message[0]?.error || errorMessage
    } else if (typeof errorData.message === "object") {
      errorMessage = errorData.message.error || errorMessage
    } else if (typeof errorData.message === "string") {
      errorMessage = errorData.message
    }
    throw new Error(errorMessage)
  }
  return response.text()
};

export async function downloadFileLesson(apiCall, fileKey) {
  const fileUrl = ENDPOINTS.DOWNLOAD_FILE_LESSON.replace(":key", encodeURIComponent(fileKey))

  try {
    const response = await apiCall(fileUrl)

    if (!response.ok) {
      return { status: false, data: response.status }
    }
    const blob = await response.blob()
    const downloadUrl = URL.createObjectURL(blob)

    return { status: true, data: downloadUrl, blob }
  } catch (error) {
    console.error("Error fetching file:", error)
    return { status: false, data: error.message }
  }
}
