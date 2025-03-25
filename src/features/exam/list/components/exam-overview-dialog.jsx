"use client"

import { useEffect, useState, Suspense } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import LoadingScreen from "@/components/layout/loading"
import GradeOverview from "./overview"
import { ENDPOINTS } from "@/lib/constants"

function ExamOverviewContent({ examCode, apiCall }) {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!examCode) return

      setIsLoading(true)
      try {
        // Get the response from the API
        const response = await apiCall(ENDPOINTS.GET_EXAM_OVERVIEW.replace(":code", examCode))

        if (response.ok) {
          const responseData = typeof response === "string"
            ? JSON.parse(response)
            : await response.json()

          // console.log("API Response:", responseData)

          // Use the parsed data
          const formattedData = {
            avgGrade: responseData?.avgGrade || "0.00",
            submittedPercent: responseData?.submittedPercent || "0%",
            excellentGradePercent: responseData?.excellentGradePercent || "0%",
            goodGradePercent: responseData?.goodGradePercent || "0%",
            badGradePercent: responseData?.badGradePercent || "0%",
            gradeDistribution: responseData?.gradeDistribution || [],
            avgProblemPoints: responseData?.avgProblemPoints || []
          }
          setData(formattedData)
        }
      } catch (err) {
        console.error("Error fetching exam overview:", err)
        setError("Failed to load exam results. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [examCode])

  if (isLoading) return <LoadingScreen />
  if (error) return <div className="p-4 text-red-500">{error}</div>
  if (!data) return <div className="p-4 pl-0">No data available</div>

  return <GradeOverview data={data} />
}

export default function ExamOverviewDialog({ examCode, isOpen, onClose, apiCall }) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl min-h-[50vh] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Exam Results Overview - {examCode}</DialogTitle>
        </DialogHeader>

        {examCode && (
          <Suspense fallback={<LoadingScreen />}>
            <ExamOverviewContent examCode={examCode} apiCall={apiCall} />
          </Suspense>
        )}
      </DialogContent>
    </Dialog>
  )
}

