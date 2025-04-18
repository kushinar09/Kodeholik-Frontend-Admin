import { ENDPOINTS } from "../constants"

export async function getLessonByChapterId(id) {
  const response = await fetch(ENDPOINTS.GET_LESSON_BY_CHAPTERID.replace(":id", id), {
    method: "GET",
    credentials: "include"
  })
  if (!response.ok) {
    throw new Error("Failed to fetch lesson")
  }
  return response.json()
}

export async function createLesson(formData, apiCall) {
  const response = await apiCall(ENDPOINTS.CREATE_LESSON, {
    method: "POST",
    credentials: "include",
    body: formData
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Failed to create lesson")
  }
  return response.json()
};

export async function downloadFileLesson(apiCall, fileKey) {
  const fileUrl = ENDPOINTS.DOWNLOAD_FILE_LESSON(fileKey)

  try {
    const response = await apiCall(fileUrl)

    if (!response.ok) {
      return { status: false, data: response.status }
    }
    const url = await response.text()
    return { status: true, data: url }
  } catch (error) {
    console.error("Error fetching file:", error)
    throw error
  }
}