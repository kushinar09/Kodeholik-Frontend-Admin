import { ENDPOINTS } from "../constants"

export async function runCode(apiCall, id, code, languageName) {
  try {
    const response = await apiCall(ENDPOINTS.POST_RUN_CODE.replace(":id", id), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, languageName })
    }, true)

    return response.json()
  } catch (error) {
    throw new Error(error.message)
  }
}

export async function submitCode(apiCall, id, code, languageName) {
  try {
    const response = await apiCall(ENDPOINTS.POST_SUBMIT_CODE.replace(":id", id), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, languageName })
    }, true)

    return response.json()
  } catch (error) {
    throw new Error(error.message)
  }
}
