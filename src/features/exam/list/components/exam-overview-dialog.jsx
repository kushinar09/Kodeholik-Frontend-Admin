"use client"

import { useEffect, useState, Suspense } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import LoadingScreen from "@/components/layout/loading"
import GradeOverview from "./overview"
import { ENDPOINTS } from "@/lib/constants"
import { toast } from "sonner"
import { Download } from "lucide-react"

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
  const handleDownloadResult = async (examCode) => {
    try {
      const response = await apiCall(ENDPOINTS.GET_DOWNLOAD_EXAM_RESULT.replace(":code", examCode))

      if (!response.ok) {
        throw new Error("Failed to download file")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `exam_result_${examCode}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast.error("Download error", {
        description: error
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl min-h-[50vh] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex gap-4 items-center">
            Exam Results Overview - {examCode}
            <div
              className="p-2 text-gray-500 cursor-pointer hover:bg-muted rounded-md"
              onClick={() => handleDownloadResult(examCode)}
            >
              <Download className="size-5" />
            </div>
          </DialogTitle>
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

