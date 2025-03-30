"use client"

import { useAuth } from "@/provider/AuthProvider"
import LoadingScreen from "@/components/layout/loading"
import { ENDPOINTS, ROLES } from "@/lib/constants"
import { Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import OverviewTeacher from "./components/overview"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { format, subMonths } from "date-fns"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

export default function Overview() {
  const { user, isLoading, apiCall } = useAuth()
  const [dataType, setDataType] = useState("challenges")
  const role = user?.role || ""

  const [challengesData, setChallengesData] = useState(null)
  const [coursesData, setCoursesData] = useState(null)
  const [dataLoading, setDataLoading] = useState(false)
  const [error, setError] = useState(null)

  // Date range state
  const [date, setDate] = useState({
    from: subMonths(new Date(), 3),
    to: new Date()
  })
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  // Track if we're using date filtering
  const [useDateFilter, setUseDateFilter] = useState(true)

  // Format date for API
  const formatDateForApi = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ` +
      `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}.` +
      `${String(date.getMilliseconds()).padStart(6, "0")}` // Microseconds
  }

  // Fetch data with date parameters
  const fetchWithDateParams = async (dateRange) => {
    if (!dateRange?.from || !dateRange?.to) return

    setDataLoading(true)
    setError(null)

    const startDateParam = formatDateForApi(dateRange.from)
    const endDateParam = formatDateForApi(dateRange.to)
    const dateQueryParams = `?start=${encodeURIComponent(startDateParam)}&end=${encodeURIComponent(endDateParam)}`

    try {
      if (dataType === "challenges") {
        const response = await apiCall(`${ENDPOINTS.GET_PROBLEM_OVERVIEW}${dateQueryParams}`)
        if (!response.ok) throw new Error("Failed to fetch challenges data")

        const data = await response.json()
        setChallengesData(data)
      } else if (dataType === "courses") {
        const response = await apiCall(`${ENDPOINTS.GET_COURSE_OVERVIEW}${dateQueryParams}`)
        if (!response.ok) throw new Error("Failed to fetch courses data")

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


  // Fetch data without date parameters
  const fetchWithoutDateParams = async () => {
    setDataLoading(true)
    setError(null)

    try {
      if (dataType === "challenges") {
        const response = await apiCall(ENDPOINTS.GET_PROBLEM_OVERVIEW)
        if (!response.ok) {
          throw new Error("Failed to fetch challenges data")
        }
        const data = await response.json()
        setChallengesData(data)
      } else if (dataType === "courses") {
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

  // Regular fetch data function that uses the current state
  const fetchData = async () => {
    if (useDateFilter && date?.from && date?.to) {
      await fetchWithDateParams(date)
    } else {
      await fetchWithoutDateParams()
    }
  }

  // Fetch data when data type changes
  useEffect(() => {
    if (role === ROLES.TEACHER) {
      // Reset data when changing tabs to force a refresh
      if (dataType === "challenges") {
        setChallengesData(null)
      } else if (dataType === "courses") {
        setCoursesData(null)
      }
      fetchData()
    }
  }, [dataType, role])

  const handleTabChange = (value) => {
    setDataType(value)
  }

  const handleApplyDateRange = () => {
    if (!date?.from || !date?.to) return

    // Enable date filtering
    setUseDateFilter(true)

    // Reset data to trigger a refetch
    if (dataType === "challenges") {
      setChallengesData(null)
    } else {
      setCoursesData(null)
    }

    setIsCalendarOpen(false)

    // Directly fetch with the current date range
    fetchWithDateParams(date)
  }

  const handleClearDateRange = () => {
    // Disable date filtering
    setUseDateFilter(false)

    // Reset date range to undefined
    setDate(undefined)

    // Reset data to trigger a refetch
    if (dataType === "challenges") {
      setChallengesData(null)
    } else {
      setCoursesData(null)
    }

    // Close the calendar if it's open
    setIsCalendarOpen(false)

    // Directly call the API without date parameters
    fetchWithoutDateParams()
  }

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
      {/* Toggle between data types and date range picker */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <Tabs defaultValue={dataType} onValueChange={handleTabChange} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="challenges">Problems</TabsTrigger>
            <TabsTrigger value="courses">Learning Courses</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Date Range Picker */}
        <div className="flex items-center gap-2">
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !useDateFilter && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {useDateFilter && date?.from && date?.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  <span>All time (no date filter)</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from || new Date()}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
              <div className="flex items-center justify-end gap-2 p-3 border-t">
                <Button variant="outline" size="sm" onClick={() => setIsCalendarOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleApplyDateRange} disabled={!date?.from || !date?.to}>
                  Apply Range
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button onClick={handleClearDateRange} className="px-3">
            Clear
          </Button>
        </div>
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

