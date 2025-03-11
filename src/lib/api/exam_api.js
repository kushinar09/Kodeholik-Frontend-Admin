import { ENDPOINTS } from "@/lib/constants"
import { MESSAGES } from "../messages"
import { toast } from "sonner"

export async function getListExamForExaminer(apiCall, body) {
  const url = `${ENDPOINTS.POST_EXAM_LIST_FOR_EXAMINER}`
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

export async function getPrivateProblemForExaminer(apiCall) {
  const url = `${ENDPOINTS.GET_PRIVATE_PROBLEM_FOR_EXAMINER}`
  const response = await apiCall(url, {
    method: "GET"
  })
  if (!response.ok) {
    throw new Error("Failed to fetch problem")
  }
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}

export async function getExamDetailForExaminer(apiCall, code) {
  const url = `${ENDPOINTS.GET_EXAM_DETAIL_FOR_EXAMINER}${code}`
  const response = await apiCall(url, {
    method: "GET"
  })
  if (!response.ok) {
    throw new Error("Failed to fetch exam")
  }
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}


export async function deleteExamForExaminer(apiCall, code) {
  const url = `${ENDPOINTS.DELETE_EXAM}${code}`
  const response = await apiCall(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    }
  })
  if (!response.ok) {
    if (response.status == 400) {
      try {
        const errorData = await response.json();
        toast.error("Error", {
          description: errorData.message,
          variant: "destructive",
          action: {
            label: "Undo",
            onClick: () => console.log("Undo"),
          },
        });
      } catch (error) {
        console.error("Error parsing error response:", error);
      }
    }
    else if (response.status == 500) {
      toast.error("Error", {
        description: MESSAGES.MSG01,
        variant: "destructive",
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      });
    }
  }
  return response;
}

export async function createExam(apiCall, body) {
  const url = `${ENDPOINTS.POST_CREATE_EXAM}`
  const response = await apiCall(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })
  if (!response.ok) {
    if (response.status == 400) {
      try {
        const errorData = await response.json();
        toast.error("Error", {
          description: errorData.message,
          variant: "destructive",
          action: {
            label: "Undo",
            onClick: () => console.log("Undo"),
          },
        });
      } catch (error) {
        console.error("Error parsing error response:", error);
      }
    }
    else if (response.status == 500) {
      toast.error("Error", {
        description: MESSAGES.MSG01,
        variant: "destructive",
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      });
    }
    return null;
  }
  else {
    const text = await response.text()
    if (!text) return null
    return JSON.parse(text)
  }
}

export async function editExam(apiCall, body, code) {
  const url = `${ENDPOINTS.POST_EDIT_EXAM}${code}`
  const response = await apiCall(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })
  if (!response.ok) {
    if (response.status == 400) {
      try {
        const errorData = await response.json();
        toast.error("Error", {
          description: errorData.message,
          variant: "destructive",
          action: {
            label: "Undo",
            onClick: () => console.log("Undo"),
          },
        });
      } catch (error) {
        console.error("Error parsing error response:", error);
      }
    }
    else if (response.status == 500) {
      toast.error("Error", {
        description: MESSAGES.MSG01,
        variant: "destructive",
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      });
    }
    return null;
  }
  else {
    const text = await response.text()
    if (!text) return null
    return JSON.parse(text)
  }
}