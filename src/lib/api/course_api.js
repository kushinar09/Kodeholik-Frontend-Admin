import { ENDPOINTS } from "../constants"

export const getCourseSearch = async (apiCall, { page, size, sortBy = "title", ascending = true, query, topic }) => {
  const endpoint = ENDPOINTS.GET_COURSES_LIST

  const queryParams = `?page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}&sortBy=${encodeURIComponent(sortBy)}&ascending=${encodeURIComponent(ascending)}`
  const fullUrl = endpoint + queryParams

  const body = {}
  if (query) body.title = query
  if (topic && topic !== "All") body.topics = [topic]

  try {
    const response = await apiCall(fullUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Fetch failed with status:", response.status, "Response:", errorText)
      throw new Error(`Failed to fetch courses: ${response.status} - ${errorText}`)
    }

    const text = await response.text()

    try {
      const jsonData = JSON.parse(text)
      return jsonData
    } catch (jsonError) {
      console.error("Failed to parse JSON:", jsonError, "Raw text:", text)
      throw new Error("Response is not valid JSON")
    }
  } catch (error) {
    console.error("Error fetching courses:", error)
    throw error
  }
}


export async function getTopicList() {
  const response = await fetch(ENDPOINTS.GET_TOPIC_LIST)
  if (!response.ok) {
    throw new Error("Failed to fetch topic")
  }
  return response.json()
}

export async function getTopicsWithId() {
  const response = await fetch(ENDPOINTS.GET_TOPICWITHID, {
    method: "GET",
    credentials: "include"
  })
  if (!response.ok) {
    throw new Error(response.message || "Failed to fetch topic")
  }
  return response.json()
}

export async function getCourse(id) {
  const response = await fetch(ENDPOINTS.GET_COURSE.replace(":id", id), {
    method: "GET",
    credentials: "include"
  })
  if (!response.ok) {
    throw new Error("Failed to fetch course")
  }
  return response.json()
}

export const createCourse = async (courseData, apiCall) => {
  if (!courseData || typeof courseData !== "object") {
    throw new Error("Invalid course data provided")
  }

  const formData = new FormData()
  formData.append("title", courseData.title)
  formData.append("description", courseData.description)
  formData.append("status", courseData.status)

  // Append topicIds as separate values
  courseData.topicIds.forEach(topicId => formData.append("topicIds", topicId))

  // Append imageFile if exists
  if (courseData.imageFile) {
    formData.append("imageFile", courseData.imageFile)
  }

  try {
    const response = await apiCall(ENDPOINTS.CREATE_COURSE, {
      method: "POST",
      body: formData
    })

    if (!response.ok) {
      const errorResponse = await response.json()
      throw new Error(`Failed to create course: ${JSON.stringify(errorResponse)}`)
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
  } catch (error) {
    console.error("Error in createCourse:", {
      error: error.message
    })
    throw error
  }
}

export async function updateCourse(id, courseData, apiCall) {
  if (!id || typeof id !== "string") {
    throw new Error("Invalid course ID provided")
  }
  if (!courseData || typeof courseData !== "object") {
    throw new Error("Invalid course data provided")
  }

  const formData = new FormData()
  formData.append("title", courseData.title)
  formData.append("description", courseData.description)
  formData.append("status", courseData.status)

  // Append topicIds as separate values
  courseData.topicIds.forEach(topicId => formData.append("topicIds", topicId))

  // Append imageFile if exists
  if (courseData.imageFile) {
    formData.append("imageFile", courseData.imageFile)
  }

  try {
    console.log(formData);
    const response = await apiCall(ENDPOINTS.UPDATE_COURSE.replace(":id", id), {
      method: "PUT",
      body: formData
    })

    if (!response.ok) {
      const errorResponse = await response.json()
      throw new Error(`Failed to update course: ${JSON.stringify(errorResponse)}`)
    }

    const text = await response.text()

    if (text.trim() === "1") {
      return { success: true }
    }

    try {
      const jsonData = JSON.parse(text)
      return jsonData
    } catch (jsonError) {
      console.warn("Response is not JSON, treating as success:", text)
      return { success: true, rawResponse: text }
    }
  } catch (error) {
    console.error("Error in updateCourse:", {
      error: error.message,
      id,
      courseData,
      hasImage: !!courseData.imageFile
    })
    throw error
  }
}

export async function usersEnrolledCourse(apiCall, id, page, size, sortBy = "enrolledAt", sortDir = "desc", query) {
  const url = ENDPOINTS.GET_USER_ENROLLED.replace(":id", id)

  const body = {
    page,
    size,
    sortBy,
    sortDir,
    ...(query && { username: query })
  }

  try {
    const response = await apiCall(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch enrolled users: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return {
      content: data.content || [],
      totalPages: data.totalPages || 1,
      totalElements: data.totalElements || 0
    }
  } catch (error) {
    console.error("Error fetching enrolled users:", error)
    throw error
  }
}

export async function getCourseDiscussion(apiCall, id, { page = 0, size = 6, sortBy = "noUpvote", sortDirection = "desc" } = {}) {
  const url = `${ENDPOINTS.GET_COURSE_DISCUSSION.replace(":id", id)}?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`

  try {
    const response = await apiCall(url)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Server Response:", errorText)
      throw new Error(`Failed to fetch discussion: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("Fetched discussion:", data)
    return data
  } catch (error) {
    console.error("Error fetching discussion:", error.message)
    throw error
  }
}

export async function getDiscussionReply(apiCall, id) {
  const url = `${ENDPOINTS.GET_DISCUSSION_REPLY.replace(":id", id)}`

  try {
    const response = await apiCall(url)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Server Response:", errorText)
      throw new Error(`Failed to fetch REPLY: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching REPLY:", error.message)
    throw error
  }
}

export async function discussionCourse(data, apiCall) {
  try {
    const response = await apiCall(ENDPOINTS.POST_COURSE_DISCUSSION, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })

    // Check if response is ok, otherwise throw an error with response text
    if (!response.ok) {
      const errorData = await response.json()
      let errorMessage = "Failed to post comment course manager"

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

    // If response has content, parse it; otherwise return success
    const contentLength = response.headers.get("content-length")
    const responseData = contentLength && contentLength !== "0" ? await response.json() : { success: true }
    console.log("discussionCourse Response:", response.status, responseData)
    return responseData
  } catch (error) {
    console.error("discussionCourse Error:", error.message)
    throw error // Propagate the error to be caught in handleSendMessage
  }
}


export async function upvoteDiscussion(apiCall, id) {
  const url = ENDPOINTS.UPVOTE_COURSE_DISCUSSION.replace(":id", id)
  try {
    const response = await apiCall(url, {
      method: "PUT"
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to upvote discussion: ${response.status} - ${errorText}`)
    }

    // For 204 status, there won't be a response body to parse
    if (response.status === 204) {
      return { success: true } // Return a simple success object
    }

    // If the API returns content (not expected in this case, but keeping for completeness)
    const responseData = await response.json()
    return responseData
  } catch (error) {
    console.error("upvoteDiscussion Error:", error.message)
    throw error
  }
}

export async function unUpvoteDiscussion(apiCall, id) {
  const url = ENDPOINTS.UN_UPVOTE_COURSE_DISCUSSION.replace(":id", id)
  try {
    const response = await apiCall(url, {
      method: "PUT"
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to unupvote discussion: ${response.status} - ${errorText}`)
    }

    // For 204 status, there won't be a response body to parse
    if (response.status === 204) {
      return { success: true } // Return a simple success object
    }

    // If the API returns content (not expected in this case, but keeping for completeness)
    const responseData = await response.json()
    return responseData
  } catch (error) {
    console.error("unUpvoteDiscussion Error:", error.message)
    throw error
  }
}