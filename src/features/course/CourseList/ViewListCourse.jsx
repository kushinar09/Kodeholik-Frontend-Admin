"use client"

import { useState, useEffect } from "react"
import { getCourseList, getTopicList } from "@/lib/api/course_api"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import Header from "@/components/layout/header"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GLOBALS } from "@/lib/constants"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Search, Plus, Edit } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const ITEMS_PER_PAGE = 5

function CourseList() {
  useEffect(() => {
    document.title = `Courses List - ${GLOBALS.APPLICATION_NAME}`
  }, [])

  const [allCourses, setAllCourses] = useState([])
  const [topics, setTopics] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("All")
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch all courses once
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true)
      try {
        const data = await getCourseList()
        console.log("API Response:", data)
        setAllCourses(Array.isArray(data) ? data : data.content || [])
      } catch (error) {
        console.error("Error fetching courses:", error)
        setAllCourses([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchCourses()
  }, []) // No dependencies, fetch once on mount

  // Fetch topics from API
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await getTopicList()
        console.log("Fetched topics:", data)
        setTopics(data || [])
      } catch (error) {
        console.error("Error fetching topics:", error)
        setTopics([])
      }
    }
    fetchTopics()
  }, [])

  // Filter and paginate courses client-side
  useEffect(() => {
    const filteredCourses = allCourses.filter(
      (course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (selectedTopic === "All" || course.topic === selectedTopic),
    )
    setTotalPages(Math.ceil(filteredCourses.length / ITEMS_PER_PAGE))
    setCurrentPage(1) // Reset to first page when filters change
  }, [allCourses, searchQuery, selectedTopic])

  const paginatedCourses = allCourses
    .filter(
      (course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (selectedTopic === "All" || course.topic === selectedTopic),
    )
    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleFilterClick = () => {
    setIsFilterExpanded(!isFilterExpanded)
  }

  const handleTopicClick = (topic) => {
    setSelectedTopic(topic === "All" ? "All" : topic)
    setCurrentPage(1)
    setIsFilterExpanded(false) // Close filter after selection
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      Active: "bg-green-500",
      Inactive: "bg-red-500",
      Draft: "bg-yellow-500",
      Completed: "bg-blue-500",
    }

    return <Badge className={`${statusMap[status] || "bg-gray-500"} text-white`}>{status}</Badge>
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="border-border-muted bg-bg-card shadow-lg">
          <CardHeader className="pb-4 border-b border-border-muted">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="text-3xl font-bold text-text-primary">Course List</CardTitle>
              <Link to="/course/add">
                <Button className="bg-primary text-white font-bold hover:bg-primary/90 transition-colors text-base py-2 px-4 w-full md:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Course
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
            
                  <Input
                    type="text"
                    placeholder="Search Course title..."
                    className="pl-10 p-2 w-full bg-input-bg text-input-text placeholder-input-placeholder border-input-border focus:border-input-borderFocus focus:ring-input-focusRing rounded-md"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  variant="ghost"
                  onClick={handleFilterClick}
                  className={cn(
                    "text-primary font-bold hover:bg-primary transition hover:text-black",
                    isFilterExpanded && "bg-button-primary text-bg-primary hover:bg-button-hover",
                  )}
                >
                  Filter
                  <span className="ml-2 text-sm">{isFilterExpanded ? "▲" : "▼"}</span>
                </Button>
              </div>

              {isFilterExpanded && (
                <div className="p-4 bg-bg-card border border-border-muted rounded-lg shadow-sm animate-in fade-in duration-200">
                  <h3 className="text-sm font-medium text-text-secondary mb-3">Filter by Topic</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={selectedTopic === "All" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTopicClick("All")}
                      className={cn(
                        "text-sm",
                        selectedTopic === "All"
                          ? "bg-primary text-black hover:bg-primary/90"
                          : "text-primary border-primary hover:bg-primary/10",
                      )}
                    >
                      All
                    </Button>
                    {topics.map((topic) => (
                      <Button
                        key={topic.id || topic}
                        variant={selectedTopic === (topic.name || topic) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTopicClick(topic.name || topic)}
                        className={cn(
                          "text-sm",
                          selectedTopic === (topic.name || topic)
                            ? "bg-primary text-black hover:bg-primary/90"
                            : "text-primary border-primary hover:bg-primary/10",
                        )}
                      >
                        {topic.name || topic}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : paginatedCourses.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                <p className="text-lg font-medium">No courses found</p>
                <p className="text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border-muted">
                <Table className="w-full">
                  <TableHeader className="bg-bg-secondary">
                    <TableRow className="hover:bg-bg-secondary/80">
                      <TableHead className="text-text-secondary font-semibold">ID</TableHead>
                      <TableHead className="text-text-secondary font-semibold">Title</TableHead>
                      <TableHead className="text-text-secondary font-semibold">Participants</TableHead>
                      <TableHead className="text-text-secondary font-semibold">Status</TableHead>
                      <TableHead className="text-text-secondary font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCourses.map((course) => (
                      <TableRow
                        key={course.id}
                        className="hover:bg-bg-secondary/30 transition-colors border-t border-border-muted"
                      >
                        <TableCell className="font-medium text-text-primary">{course.id}</TableCell>
                        <TableCell className="text-text-primary">{course.title}</TableCell>
                        <TableCell className="text-text-primary">{course.numberOfParticipant}</TableCell>
                        <TableCell>{getStatusBadge(course.status)}</TableCell>
                        <TableCell>
                          <Link to={`/course/${course.id}`}>
                            <Button
                              variant="outline"
                              className="border-primary text-primary hover:bg-primary hover:text-black transition-colors"
                              size="sm"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {!isLoading && paginatedCourses.length > 0 && (
              <div className="flex justify-center mt-6 gap-2">
                <Button
                  variant="ghost"
                  className="text-primary font-bold hover:bg-primary transition hover:text-black"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, index) => {
                    // Show limited page numbers with ellipsis for better UX
                    if (
                      totalPages <= 5 ||
                      index === 0 ||
                      index === totalPages - 1 ||
                      (index >= currentPage - 1 && index <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          variant="ghost"
                          key={index}
                          onClick={() => handlePageChange(index + 1)}
                          className={cn(
                            "text-primary font-bold hover:bg-primary transition hover:text-black",
                            currentPage === index + 1 && "bg-button-primary text-bg-primary hover:bg-button-hover",
                          )}
                        >
                          {index + 1}
                        </Button>
                      )
                    } else if (
                      (index === 1 && currentPage > 3) ||
                      (index === totalPages - 2 && currentPage < totalPages - 2)
                    ) {
                      return (
                        <Button key={index} variant="ghost" disabled className="text-primary font-bold">
                          ...
                        </Button>
                      )
                    }
                    return null
                  })}
                </div>
                <Button
                  variant="ghost"
                  className="text-primary font-bold hover:bg-primary transition hover:text-black"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default CourseList

