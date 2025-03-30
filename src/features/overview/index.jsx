"use client"

import { useAuth } from "@/provider/AuthProvider"
import LoadingScreen from "@/components/layout/loading"
import { ENDPOINTS, ROLES } from "@/lib/constants"
import { Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import OverviewTeacher from "./components/overview"

export default function Overview() {
  const { user, isLoading, apiCall } = useAuth()
  const [dataType, setDataType] = useState("challenges")
  const role = user?.role || ""

  const [challengesData, setChallengesData] = useState(null)
  const [coursesData, setCoursesData] = useState(null)
  const [dataLoading, setDataLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setDataLoading(true)
    setError(null)

    try {
      if (dataType === "challenges" && !challengesData) {
        const response = await apiCall(ENDPOINTS.GET_PROBLEM_OVERVIEW)
        if (!response.ok) {
          throw new Error("Failed to fetch challenges data")
        }
        const data = await response.json()
        setChallengesData(data)
      } else if (dataType === "courses" && !coursesData) {
        const response = await apiCall(ENDPOINTS.GET_COURSE_OVERVIEW)
        if (!response.ok) {
          throw new Error("Failed to fetch courses data")
        }
        const data = await response.json()
        setCoursesData(data)
      }
    } catch (err) {
      setError(err.message)
      console.error("Error fetching data:", err)
    } finally {
      setDataLoading(false)
    }
  }
  // Fetch data based on the selected data type
  useEffect(() => {
    if (role === ROLES.TEACHER)
      fetchData()
  }, [dataType, challengesData, coursesData])

  if (isLoading) {
    return <LoadingScreen />
  }

  if (role === ROLES.ADMIN) {
    return <Navigate to="/user" replace />
  }

  if (role === ROLES.EXAMINER) {
    return <Navigate to="/exam" replace />
  }

  return (
    <div>
      {/* Toggle between data types */}
      <div className="flex justify-center">
        <Tabs defaultValue={dataType} onValueChange={(value) => setDataType(value)} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="challenges">Problems</TabsTrigger>
            <TabsTrigger value="courses">Learning Courses</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Show loading state while fetching data */}
      {dataLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingScreen />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 p-4">Error loading data: {error}</div>
      ) : /* Render the appropriate overview based on selected type */
        dataType === "challenges" && challengesData ? (
          <OverviewTeacher type="challenges" data={challengesData} />
        ) : dataType === "courses" && coursesData ? (
          <OverviewTeacher type="courses" data={coursesData} />
        ) : (
          <div className="text-center p-4">No data available</div>
        )}
    </div>
  )
}

