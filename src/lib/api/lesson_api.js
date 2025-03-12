import { ENDPOINTS } from "../constants"

export async function getLessonList() {
    const response = await fetch(ENDPOINTS.GET_LESSONS, {
        method: "GET",
        credentials: "include"
    });
    if (!response.ok) {
      throw new Error("Failed to fetch lesson")
    }
    return response.json()
  }

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

export async function getLessonById(id) {
    const response = await fetch(ENDPOINTS.GET_LESSON_DETAIL.replace(":id", id), {
      method: "GET",
      credentials: "include"
    })
    if (!response.ok) {
      throw new Error("Failed to fetch lesson detail")
    }
    return response.json()
  }

export async function createLesson(formData, apiCall) {
    const response = await apiCall(ENDPOINTS.CREATE_LESSON, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to create lesson");
    }
    return response.json();
  };

  export async function updateLesson(id, formData, apiCall) {
    const response = await apiCall(ENDPOINTS.CREATE_LESSON.replace(":id", id), {
      method: "PUT",
      credentials: "include",
      body: formData,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to update lesson");
    }
    return response.json();
  };