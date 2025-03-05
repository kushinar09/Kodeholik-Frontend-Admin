import { ENDPOINTS } from "../constants"

export async function getProblemDescription(id) {
  const response = await fetch(ENDPOINTS.GET_PROBLEM_DESCRIPTION.replace(":id", id))
  if (response.ok) {
    return { status: true, data: await response.json() }
  }

  if (response.status === 404) {
    return { status: false, message: "Problem not found" }
  }
  return { status: false }
}

export async function getProblemEditorial(apiCall, id) {
  const response = await apiCall(ENDPOINTS.GET_PROBLEM_EDITORIAL.replace(":id", id))
  if (response.ok) {
    const data = await response.json()
    return { status: true, data: data.editorialDto }
  }

  if (response.status === 404) {
    return { status: false, message: "Problem not found" }
  }

  return { status: false }
}

export async function getProblemSolutions(apiCall, id, page = 0, size = 15, title, languageName, sortBy, ascending) {
  const url = `${ENDPOINTS.GET_PROBLEM_SOLUTIONS.replace(":id", id)}${"?page=" + page}${size ? "&size=" + size : ""}${title ? "&title=" + title : ""}${languageName ? "&languageName=" + languageName : ""}${sortBy ? "&sortBy=" + sortBy : ""}${ascending ? "&ascending=" + ascending : ""}`
  const response = await apiCall(url, {
    method: "POST",
    // body: JSON.stringify(body)
  })
  if (response.ok) {
    const data = await response.json()
    console.log(data)
    return { status: true, data: data }
  }

  if (response.status === 404) {
    return { status: false, message: "Problem not found" }
  }

  return { status: false }
}

export async function getProblemList(page = 0, size, sortBy, ascending, body) {
  const url = `${ENDPOINTS.POST_PROBLEMS_LIST}${"?page=" + page}${size ? "&size=" + size : ""}${sortBy ? "&sortBy=" + sortBy : ""}${ascending != null ? "&ascending=" + ascending : ""}`
  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })
  if (!response.ok) {
    throw new Error("Failed to fetch problems")
  }
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}

export async function postCommentProblem(apiCall, id, comment, commentReply = null) {
  const response = await apiCall(ENDPOINTS.POST_COMMENT_PROBLEM.replace(":id", id), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(
      {
        "comment": comment,
        "location": "PROBLEM",
        "locationId": id,
        "commentReply": commentReply
      }
    )
  })
  if (response.ok) {
    return { status: true }
  }

  if (response.status === 404) {
    return { status: false, message: "Problem not found" }
  }

  return { status: false }
}

export async function getProblem(id) {
  const response = await fetch(ENDPOINTS.GET_PROBLEM.replace(":id", id))
  if (!response.ok) {
    throw new Error("Failed to fetch problem")
  }
  return response.json()
}

export async function getProblemInitCode(id, language) {
  const response = await fetch(ENDPOINTS.GET_PROBLEM_INIT_CODE.replace(":id", id) + "?languageName=" + language)
  if (response.ok) {
    return { status: true, data: await response.json() }
  }

  if (response.status === 404) {
    return { status: false, message: "Problem not found" }
  }
  return { status: false }
}

export async function createProblem(data) {
  const response = await fetch(ENDPOINTS.CREATE_PROBLEM, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    throw new Error("Failed to create problem")
  }
  return response.json()
}

export async function updateProblem(id, data) {
  const response = await fetch(ENDPOINTS.UPDATE_PROBLEM.replace(":id", id), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    throw new Error("Failed to update problem")
  }
  return response.json()
}

export async function deleteProblem(id) {
  const response = await fetch(ENDPOINTS.DELETE_PROBLEM.replace(":id", id), {
    method: "DELETE"
  })
  if (!response.ok) {
    throw new Error("Failed to delete problem")
  }
}

export async function getCourseList() {
  const response = await fetch(ENDPOINTS.GET_COURSES)
  if (!response.ok) {
    throw new Error("Failed to fetch courses")
  }
  return response.json()
}