import { ENDPOINTS } from "@/lib/constants"
import { MESSAGES } from "../messages"
import { toast } from "sonner"

export async function getListTagForAdmin(apiCall, body) {
  const url = `${ENDPOINTS.POST_TAG_LIST_FOR_ADMIN}`
  const response = await apiCall(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })
  if (!response.ok) {
    throw new Error("Failed to fetch tag list")
  }
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}

export async function deleteTag(apiCall, id, type) {
  const url = `${ENDPOINTS.DELETE_TAG}${id}?tagType=${type}`
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
          variant: "destructive"
        });
      } catch (error) {
        console.error("Error parsing error response:", error);
      }
    }
    else if (response.status == 500) {
      toast.error("Error", {
        description: MESSAGES.MSG01,
        variant: "destructive"
      });
    }
    throw new Error("Error");
  }
  return null;
}

export async function addTag(apiCall, body) {
  const url = `${ENDPOINTS.ADD_TAG}`
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
          variant: "destructive"
        });
      } catch (error) {
        console.error("Error parsing error response:", error);
      }
    }
    else if (response.status == 500) {
      toast.error("Error", {
        description: MESSAGES.MSG01,
        variant: "destructive"
      });
    }
    throw new Error("Error");
  }
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}

export async function editTag(apiCall, body, id) {
  const url = `${ENDPOINTS.EDIT_TAG}${id}`
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
          variant: "destructive"
        });
      } catch (error) {
        console.error("Error parsing error response:", error);
      }
    }
    else if (response.status == 500) {
      toast.error("Error", {
        description: MESSAGES.MSG01,
        variant: "destructive"
      });
    }
    throw new Error("Error");
  }
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}