import { ENDPOINTS } from "../constants"

export const getCourseSearch = async ({ page, size, sortBy = "title", ascending = true, query, topic }) => {
  const endpoint = ENDPOINTS.GET_COURSES_LIST

  const queryParams = `?page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}&sortBy=${encodeURIComponent(sortBy)}&ascending=${encodeURIComponent(ascending)}`
  const fullUrl = endpoint + queryParams

  const body = {}
  if (query) body.title = query
  if (topic && topic !== "All") body.topics = [topic]

  try {
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body)
    })

    // console.log("Response status:", response.status)
    // console.log("Response headers:", Object.fromEntries(response.headers.entries()))

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
    throw new Error("Failed to fetch topic")
  }
  return response.json()
}


export async function getCourseList() {
  const response = await fetch(ENDPOINTS.GET_COURSES)
  if (!response.ok) {
    throw new Error("Failed to fetch courses")
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

export async function getImage(imageKey) {
  const imageUrl = ENDPOINTS.GET_IMAGE(imageKey)

  try {
    const response = await fetch(imageUrl, {
      method: "GET",
      credentials: "include"
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch image. Status: ${response.status}`)
    }
    // 🔥 FIX: Read response as text instead of JSON
    const url = await response.text()
    return url
  } catch (error) {
    console.error("Error fetching image:", error)
    throw error
  }
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


export async function enrollCourse(id) {
  const response = await fetch(ENDPOINTS.ENROLL_COURSE.replace(":id", id), {
    method: "POST",
    credentials: "include"
  })
  if (!response.ok) { // Corrected condition
    const errorResponse = await response.json()
    throw new Error(`Failed to enroll: ${JSON.stringify(errorResponse)}`)
  }
  return response
}
export async function unEnrollCourse(id) {
  const response = await fetch(ENDPOINTS.UNENROLL_COURSE.replace(":id", id), {
    method: "DELETE",
    credentials: "include"
  })
  if (!response.ok) { // Corrected condition
    const errorResponse = await response.json()
    throw new Error(`Failed to unenroll: ${JSON.stringify(errorResponse)}`)
  }
  return response
}

export async function usersEnrolledCourse(id, page, size, sortBy = "enrolledAt", sortDir = "desc", query) {
  const url = ENDPOINTS.GET_USER_ENROLLED.replace(":id", id)

  const body = {
    page,
    size,
    sortBy,
    sortDir,
    ...(query && { username: query })
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
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

export async function getRateCommentCourse(id) {
  // Ensure id is defined and a valid number
  if (!id || isNaN(id)) {
    throw new Error("Invalid courseId provided")
  }

  const url = ENDPOINTS.GET_COMMENT_COURSE.replace(":id", id) // Remove comma from placeholder
  console.log("Fetching comments from URL:", url)

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include"
    })
    console.log("Response Status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Server Response:", errorText)
      throw new Error(`Failed to fetch comments: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("Fetched Comments:", data)
    return data
  } catch (error) {
    console.error("Error fetching comments:", error.message)
    throw error
  }
}

export async function rateCommentCourse(data, apiCall) {
  try {
    const responseData = await apiCall(ENDPOINTS.RATE_COMMENT_COURSE, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
    console.log("rateCommentCourse Response Data:", responseData)
    return responseData // Return the parsed data directly
  } catch (error) {
    console.error("rateCommentCourse Error:", error.message)
    throw error // Propagate the error from apiCall
  }
}

export async function getCourseDiscussion(id, { page = 0, size = 6, sortBy = "noUpvote", sortDirection = "desc" } = {}) {
  const url = `${ENDPOINTS.GET_COURSE_DISCUSSION.replace(":id", id)}?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`
  console.log("Fetching discussion from URL:", url)

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include"
    })
    console.log("Response Status:", response.status)

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

export async function getDiscussionReply(id) {
  const url = `${ENDPOINTS.GET_DISCUSSION_REPLY.replace(":id", id)}`
  console.log("Fetching REPLY from URL:", url)

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include"
    })
    console.log("Response Status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Server Response:", errorText)
      throw new Error(`Failed to fetch REPLY: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("Fetched REPLY:", data)
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
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })

    // Check if response is ok, otherwise throw an error with response text
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Server error: ${response.status} - ${errorText}`)
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


export async function upvoteDiscussion(id) {
  const url = ENDPOINTS.UPVOTE_COURSE_DISCUSSION.replace(":id", id)
  try {
    const response = await fetch(url, {
      method: "PUT",
      credentials: "include"
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to upvote discussion: ${response.status} - ${errorText}`)
    }

    // For 204 status, there won't be a response body to parse
    if (response.status === 204) {
      console.log("upvoteDiscussion: Successfully upvoted comment", id)
      return { success: true } // Return a simple success object
    }

    // If the API returns content (not expected in this case, but keeping for completeness)
    const responseData = await response.json()
    console.log("upvoteDiscussion Response Data:", responseData)
    return responseData
  } catch (error) {
    console.error("upvoteDiscussion Error:", error.message)
    throw error
  }
}

export async function unUpvoteDiscussion(id) {
  const url = ENDPOINTS.UN_UPVOTE_COURSE_DISCUSSION.replace(":id", id)
  try {
    const response = await fetch(url, {
      method: "PUT",
      credentials: "include"
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to unupvote discussion: ${response.status} - ${errorText}`)
    }

    // For 204 status, there won't be a response body to parse
    if (response.status === 204) {
      console.log("unUpvoteDiscussion: Successfully un-upvoted comment", id)
      return { success: true } // Return a simple success object
    }

    // If the API returns content (not expected in this case, but keeping for completeness)
    const responseData = await response.json()
    console.log("unUpvoteDiscussion Response Data:", responseData)
    return responseData
  } catch (error) {
    console.error("unUpvoteDiscussion Error:", error.message)
    throw error
  }
}