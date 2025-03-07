import { useEffect } from "react"
import CourseForm from "../CourseForm"
import { GLOBALS } from "@/lib/constants"
import Header from "@/components/layout/header"



function CreateCourse() {
  useEffect(() => {
    document.title = `Create Course - ${GLOBALS.APPLICATION_NAME}`
  }, [])

  return (
    <div className="min-h-screen bg-bg-primary">
        <div className="container mx-auto p-6">
            <h1 className="text-2xl text-text-primary font-bold mb-4">Create New Course</h1>
            <CourseForm />
        </div>
    </div>
  )
}

export default CreateCourse