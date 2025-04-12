import { ENDPOINTS } from "../constants"

export async function getLessonByChapterId(apiCall, id) {
  const response = await apiCall(ENDPOINTS.GET_LESSON_BY_CHAPTERID.replace(":id", id))
  if (!response.ok) {
    throw new Error("Failed to fetch lesson")
  }
  return response.json()
}

export async function createLesson(formData, apiCall) {
  const response = await apiCall(ENDPOINTS.CREATE_LESSON, {
    method: "POST",
    body: formData
  })
  if (!response.ok) {
    const errorText = await response.message
    throw new Error(errorText || "Failed to create lesson")
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
