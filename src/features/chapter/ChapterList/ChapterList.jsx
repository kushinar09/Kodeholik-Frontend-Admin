"use client"

import { useState, useEffect } from "react"
import { getChapterByCourseId } from "@/lib/api/chapter_api"
import { getCourseSearch } from "@/lib/api/course_api"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GLOBALS } from "@/lib/constants"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Plus, Edit, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/provider/AuthProvider"
import { useNavigate } from "react-router-dom"

function ChapterList({ onNavigate }) {
  const { apiCall } = useAuth()
  const [chapters, setChapters] = useState([])
  const [courseId, setCourseId] = useState(null)
  const [courses, setCourses] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [courseSearchQuery, setCourseSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const [currentPage, setCurrentPage] = useState(0)
  const [sortBy, setSortBy] = useState("id")
  const [sortOrder, setSortOrder] = useState("asc")
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    document.title = `Chapter List - ${GLOBALS.APPLICATION_NAME}`
  }, [])

  // Fetch courses for filter
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourseSearch(apiCall, {
          page: 0,
          size: 100,
          sortBy: "title",
          ascending: true
        })
        setCourses(data.content || [])

        // Get courseId from URL
        const urlCourseId = new URLSearchParams(window.location.search).get("courseId")

        // If courseId exists in URL, convert it to number for proper comparison
        const numericCourseId = urlCourseId ? Number.parseInt(urlCourseId, 10) : null

        // Set initial selected course based on URL courseId
        if (numericCourseId && data?.content?.some((course) => course.id === numericCourseId)) {
          setCourseId(numericCourseId)
          setSelectedCourse(numericCourseId)
        } else if (data?.content?.length > 0) {
          // If no courseId in URL, use the first course
          setCourseId(data.content[0].id)
          setSelectedCourse(data.content[0].id)
        }
      } catch (error) {
        console.error("Error fetching courses:", error)
        setCourses([])
      }
    }
    fetchCourses()
  }, [])

  // Fetch chapters
  useEffect(() => {
    const fetchChapters = async () => {
      setIsLoading(true)
      try {
        const data = await getChapterByCourseId(courseId)
        setChapters(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error fetching chapters:", error)
        setChapters([])
      } finally {
        setIsLoading(false)
      }
    }
    if (courseId) fetchChapters()
  }, [courseId])

  // Client-side sorting
  const sortedChapters = [...chapters].sort((a, b) => {
    const order = sortOrder === "asc" ? 1 : -1
    if (sortBy === "id") return order * (a.id - b.id)
    if (sortBy === "title") return order * a.title.localeCompare(b.title)
    return 0
  })

  // Client-side search for chapters
  const filteredChapters = sortedChapters.filter((chapter) =>
    chapter.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Client-side pagination
  const totalItems = filteredChapters.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedChapters = filteredChapters.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)

  // Filter courses based on search query in the filter
  const filteredCourses = courses.filter((course) =>
    (course.title || `Unnamed Course (ID: ${course.id})`).toLowerCase().includes(courseSearchQuery.toLowerCase())
  )

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
    setCurrentPage(0)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value))
    setCurrentPage(0)
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      ACTIVATED: "bg-green-500",
      INACTIVATED: "bg-red-500"
    }
    return <Badge className={`${statusMap[status] || "bg-gray-500"} text-white`}>{status?.toUpperCase()}</Badge>
  }

  // Handle filter toggle
  const handleFilterClick = () => {
    setIsFilterExpanded(!isFilterExpanded)
  }

  // Handle course selection
  const handleCourseClick = (course) => {
    setCourseId(course.id)
    setSelectedCourse(course.id || `Unnamed Course (ID: ${course.id})`)
    setIsFilterExpanded(false)
    setCourseSearchQuery("")
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <main className="flex-grow">
        <Card className="border-border-muted bg-bg-card shadow-lg">
          <CardHeader className="pb-4 border-b border-border-muted">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="text-xl font-bold text-text-primary">Chapter List</CardTitle>
              <Button
                onClick={() => navigate("/chapter/add", { state: { courseId: courseId } })}
                className="bg-primary text-white font-semibold hover:bg-primary/90 transition-colors text-base py-2 px-4 w-full md:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Chapter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow">
                  <Input
                    type="text"
                    placeholder="Search chapter title..."
                    className="pl-10 p-2 w-full bg-input-bg text-input-text placeholder-input-placeholder border-input-border focus:border-input-borderFocus focus:ring-input-focusRing rounded-md"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div>
                  <Button
                    variant="ghost"
                    onClick={handleFilterClick}
                    className={cn("text-primary font-bold transition hover:bg-primary hover:text-white")}
                  >
                    Filter by Course
                    <span className="ml-2 text-sm">{isFilterExpanded ? "▲" : "▼"}</span>
                  </Button>
                </div>
              </div>

              {isFilterExpanded && (
                <div className="p-4 bg-bg-card border border-border-muted rounded-lg shadow-sm animate-in fade-in duration-200">
                  <h3 className="text-sm font-medium text-text-secondary mb-3">Filter by Course</h3>
                  <div className="relative mb-3">
                    <Input
                      type="text"
                      placeholder="Search course name..."
                      className="pl-10 p-2 w-full bg-input-bg text-input-text placeholder-input-placeholder border-input-border focus:border-input-borderFocus focus:ring-input-focusRing rounded-md"
                      value={courseSearchQuery}
                      onChange={(e) => setCourseSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap max-h-40 overflow-y-auto">
                    {filteredCourses.length > 0 ? (
                      filteredCourses.map((course) => (
                        <Button
                          key={course.id}
                          variant={selectedCourse === course.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleCourseClick(course)}
                          className={cn(
                            "text-sm",
                            selectedCourse === course.id
                              ? "bg-primary text-white hover:bg-primary/90"
                              : "text-primary border-primary hover:bg-primary/10"
                          )}
                        >
                          {course.title || `Unnamed Course (ID: ${course.id})`}
                        </Button>
                      ))
                    ) : (
                      <p className="text-sm text-text-secondary">No courses found</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredChapters.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                <p className="text-lg font-medium">No chapters found</p>
                <p className="text-sm mt-2">Try adjusting your search or course selection</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border-muted">
                <Table className="w-full">
                  <TableHeader className="bg-bg-secondary">
                    <TableRow className="hover:bg-bg-secondary/80">
                      <TableHead
                        className="text-text-secondary font-semibold cursor-pointer"
                        onClick={() => handleSort("id")}
                      >
                        ID {sortBy === "id" && (sortOrder === "asc" ? "▲" : "▼")}
                      </TableHead>
                      <TableHead
                        className="text-text-secondary font-semibold cursor-pointer"
                        onClick={() => handleSort("title")}
                      >
                        Title {sortBy === "title" && (sortOrder === "asc" ? "▲" : "▼")}
                      </TableHead>
                      <TableHead>Course ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-text-secondary font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedChapters.map((chapter) => (
                      <TableRow
                        key={chapter.id}
                        className="hover:bg-bg-secondary/30 transition-colors border-t border-border-muted"
                      >
                        <TableCell className="font-medium text-text-primary">{chapter.id}</TableCell>
                        <TableCell className="text-text-primary truncate max-w-36" title={chapter.title}>
                          {chapter.title}
                        </TableCell>
                        <TableCell className="text-text-primary">{chapter.courseId}</TableCell>
                        <TableCell>{getStatusBadge(chapter.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => onNavigate(`/chapter/${chapter.id}`)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {!isLoading && filteredChapters.length > 0 && (
              <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Items per page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 per page</SelectItem>
                    <SelectItem value="12">12 per page</SelectItem>
                    <SelectItem value="24">24 per page</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="text-primary font-bold transition hover:bg-primary hover:text-primary-foreground"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </Button>
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, index) => (
                      <Button
                        key={index}
                        onClick={() => handlePageChange(index)}
                        className={cn(
                          "font-semibold transition",
                          currentPage === index
                            ? "bg-primary text-primary-foreground"
                            : "text-primary bg-transparent hover:bg-primary hover:text-primary-foreground"
                        )}
                      >
                        {index + 1}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    className="text-primary font-bold transition hover:bg-primary hover:text-primary-foreground"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default ChapterList
