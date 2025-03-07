import { ENDPOINTS } from "@/lib/constants"
import { MESSAGES } from "../messages"

export async function getListExamForExaminer(apiCall, body) {
  const url = `${ENDPOINTS.POST_EXAM_LIST_FOR_EXAMINER}`
  console.log(url)
  const response = await apiCall(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })
  if (!response.ok) {
    throw new Error("Failed to fetch exam list")
  }
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}

export async function deleteExamForExaminer(apiCall, code) {
  const url = `${ENDPOINTS.DELETE_EXAM}{code}`
  const response = await apiCall(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    }
  })
  if (!response.ok) {
    throw new Error("Failed to delete exam")
  }
  return response;
}