import { ENDPOINTS } from "../constants"

export const getCourseSearch = async ({ page, size, sortBy, ascending, query, topic }) => {
  const url = new URL(ENDPOINTS.GET_COURSES);
  url.searchParams.append("page", page);
  url.searchParams.append("size", size);
  url.searchParams.append("sortBy", sortBy);
  url.searchParams.append("ascending", ascending);
  if (query) url.searchParams.append("title", query); // Use "title" instead of "query"
  if (topic) url.searchParams.append("topic", topic);

  const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch courses");
  return await response.json();
};

export async function getTopicList() {
    const response = await fetch(ENDPOINTS.GET_TOPIC_LIST)
    if (!response.ok) {
      throw new Error("Failed to fetch topic")
    }
    return response.json()
}

export async function getTopicsWithId() {
  const response = await fetch(ENDPOINTS.GET_tOPICWITHID, {
    method: "GET",
    credentials: "include",
  });
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
    const response = await fetch(ENDPOINTS.GET_COURSE.replace(":id", id))
    if (!response.ok) {
      throw new Error("Failed to fetch course")
    }
    return response.json()
  }

  export async function getImage(imageKey) { 
    const imageUrl = ENDPOINTS.GET_IMAGE(imageKey);
    console.log("Fetching image from:", imageUrl); // Debugging
  
    try {
        const response = await fetch(imageUrl, {
            method: "GET",
            credentials: "include",
        });

        console.log("Response Status:", response.status); // Log the status

        if (!response.ok) {
            throw new Error(`Failed to fetch image. Status: ${response.status}`);
        }
        // 🔥 FIX: Read response as text instead of JSON
        const url = await response.text();  
        return url;
    } catch (error) {
        console.error("Error fetching image:", error);
        throw error;
    }
}


export const createCourse = async (courseData, imageFile, apiCall) => {
  // Validate that courseData is a FormData object
  if (!courseData || !(courseData instanceof FormData)) {
    throw new Error("Course data must be a FormData object");
  }

  // Create a new FormData object to ensure we don’t modify the input
  const formPayload = new FormData();

  // Copy existing entries from courseData to formPayload
  for (let [key, value] of courseData.entries()) {
    formPayload.append(key, value);
  }

  // Append the imageFile if it exists and is a valid File or Blob
  if (imageFile && (imageFile instanceof File || imageFile instanceof Blob)) {
    formPayload.append("image", imageFile);
  }

  try {
    const response = await apiCall(ENDPOINTS.CREATE_COURSE, {
      method: "POST",
      credentials: "include",
      body: formPayload,
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(`Failed to create course: ${JSON.stringify(errorResponse)}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in createCourse:", {
      error: error.message,
      formDataEntries: [...formPayload.entries()], // Log the updated FormData
    });
    throw error;
  }
};

export async function updateCourse(id, courseData, imageFile, apiCall) {
  // Validate inputs
  if (!id || typeof id !== 'string') {
      throw new Error('Invalid course ID provided');
  }
  if (!courseData || typeof courseData !== 'object') {
      throw new Error('Invalid course data provided');
  }

  const formData = new FormData();
  
  // Append course data as JSON Blob with explicit type
  formData.append("data", new Blob([JSON.stringify(courseData)], { type: "application/json" }));

  // Append image file if provided, with validation
  if (imageFile) {
      if (!(imageFile instanceof File || imageFile instanceof Blob)) {
          throw new Error('Invalid image file provided');
      }
      formData.append("image", imageFile);
  }

  try {
      const response = await apiCall(ENDPOINTS.UPDATE_COURSE.replace(":id", id), {
          method: "PUT",
          credentials: "include",
          body: formData,
      });

      if (!response.ok) {
          const errorResponse = await response.json();
          throw new Error(`Failed to update course: ${JSON.stringify(errorResponse)}`);
      }

      return await response.json();
  } catch (error) {
      // Log more detailed information for debugging
      console.error('Error in updateCourse:', {
          error: error.message,
          id,
          courseData,
          hasImage: !!imageFile,
          formDataEntries: [...formData.entries()] // Log FormData contents
      });
      throw error;
  }
}

  export async function enrollCourse(id) {  
    const response = await fetch(ENDPOINTS.ENROLL_COURSE.replace(":id", id), {
      method: "POST",
      credentials: "include"
    }) 
    if (!response.ok) {  // Corrected condition
      const errorResponse = await response.json();
      throw new Error(`Failed to enroll: ${JSON.stringify(errorResponse)}`);
    }
    return response;
}
  export async function unEnrollCourse(id) {  
    const response = await fetch(ENDPOINTS.UNENROLL_COURSE.replace(":id", id), {
      method: "DELETE",
      credentials: "include"
    }) 
    if (!response.ok) {  // Corrected condition
      const errorResponse = await response.json();
      throw new Error(`Failed to unenroll: ${JSON.stringify(errorResponse)}`);
    }
    return response;
  }
