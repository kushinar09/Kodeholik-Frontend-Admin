import { getCourse } from "@/lib/api/course_api"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import CourseForm from "../CourseForm"
import { GLOBALS } from "@/lib/constants"
import Header from "@/components/layout/header"

function UpdateCourse() {
  useEffect(() => {
    document.title = `Update Course - ${GLOBALS.APPLICATION_NAME}`
  }, [])

  const [course, setCourse] = useState(null)
  const { id } = useParams()

  useEffect(() => {
    const fetchCourse = async () => {
      const data = await getCourse(id)
      setCourse(data)
    }
    fetchCourse()
  }, [id])

  if (!course) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-bg-primary">
        <div className="container mx-auto p-6">
            <h1 className="text-2xl text-text-primary font-bold mb-4">Update Course</h1>
            <CourseForm course={course}/>
        </div>
    </div>
  )
}

export default UpdateCourse

