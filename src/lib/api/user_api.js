import { ENDPOINTS } from "@/lib/constants"
import { MESSAGES } from "../messages"
import { toast } from "sonner"

export async function getListUserForAdmin(apiCall, body) {
  const url = `${ENDPOINTS.POST_USER_LIST_FOR_ADMIN}`
  const response = await apiCall(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })
  if (!response.ok) {
    throw new Error("Failed to fetch user list")
  }
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}

export async function banUser(apiCall, id) {
  const url = `${ENDPOINTS.BAN_USER}${id}`
  const response = await apiCall(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    }
  })
  if (!response.ok) {
    throw new Error("Failed to ban user")
  }
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
  }
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}

export async function unbanUser(apiCall, id) {
  const url = `${ENDPOINTS.UNBAN_USER}${id}`
  const response = await apiCall(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    }
  })
  if (!response.ok) {
    throw new Error("Failed to unban user")
  }
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
  }
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}

export async function addUser(apiCall, body) {
  const url = `${ENDPOINTS.CREATE_USER}`
  const response = await apiCall(url, {
    method: "POST",
    body: body
  })
  if (!response.ok) {
    if (response.status == 400) {
      try {
        const errorData = await response.json();
        toast.error("Error", {
          description: "Failed to add user. Please check all the field again",
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
    throw new Error("Failed to add user");
  }
  else {
    return null;
  }
}

export async function editUser(apiCall, body, id) {
  const url = `${ENDPOINTS.EDIT_USER}${id}`
  const response = await apiCall(url, {
    method: "PUT",
    body: body
  })
  if (!response.ok) {
    if (response.status == 400) {
      try {
        const errorData = await response.json();
        toast.error("Error", {
          description: "Failed to add user. Please check all the field again",
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
    throw new Error("Failed to add user");
  }
  else {
    return null;
  }
}

export async function getUserDetailForAdmin(apiCall, id) {
  const url = `${ENDPOINTS.DETAIL_USER}${id}`
  const response = await apiCall(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
  if (!response.ok) {
    throw new Error("Failed to fetch user detail")
  }
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}