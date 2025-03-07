import { ENDPOINTS } from "@/lib/constants"
import { MESSAGES } from "../messages"

export async function getListExamForExaminer(apiCall, body) {
    //const url = `${ENDPOINTS.POST_EXAM_LIST_FOR_EXAMINER}`
    const url = `http://localhost:8080/api/v1/examiner/list`
    console.log(url);
    const response = await apiCall(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })
    // if (!response.ok) {
    //   throw new Error("Failed to fetch exam list");
    // }
    // const text = await response.text()
    // if (!text) return null
    // return JSON.parse(text)
    return null;
}