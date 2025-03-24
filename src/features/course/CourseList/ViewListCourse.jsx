import { useState, useEffect } from "react"
import { getCourseSearch, getTopicsWithId } from "@/lib/api/course_api"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GLOBALS } from "@/lib/constants"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Search, Plus, Edit, MoreHorizontal, Paperclip, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

function CourseList({ onNavigate }) {
  useEffect(() => {
    document.title = `Courses List - ${GLOBALS.APPLICATION_NAME}`
  }, [])

  const [courses, setCourses] = useState([])
  const [topics, setTopics] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("All")
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState("title")
  const [sortOrder, setSortOrder] = useState("asc")
  const [itemsPerPage, setItemsPerPage] = useState(6)

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true)
      try {
        const data = await getCourseSearch({
          page: currentPage,
          size: itemsPerPage,
          sortBy,
          ascending: sortOrder === "asc",
          query: searchQuery,
          topic: selectedTopic
        })
        setCourses(data.content || [])
        setTotalPages(data.totalPages || 1)
      } catch (error) {
        console.error("Error fetching courses:", error)
        setCourses([])
        setTotalPages(1)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCourses()
  }, [currentPage, itemsPerPage, sortBy, sortOrder, searchQuery, selectedTopic])

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await getTopicsWithId()
        setTopics(data || [])
      } catch (error) {
        console.error("Error fetching topics:", error)
        setTopics([])
      }
    }
    fetchTopics()
  }, [])

  const handlePageChange = (page) => {
    setCurrentPage(page - 1)
  }

  const handleFilterClick = () => {
    setIsFilterExpanded(!isFilterExpanded)
  }

  const handleTopicClick = (topic) => {
    setSelectedTopic(topic === "All" ? "All" : topic)
    setCurrentPage(0)
    setIsFilterExpanded(false)
  }

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
    setCurrentPage(0)
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
    return (
      <Badge className={`${statusMap[status] || "bg-gray-500"} text-white`}>
        {status?.toUpperCase()}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="border-border-muted bg-bg-card shadow-lg">
          <CardHeader className="pb-4 border-b border-border-muted">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="text-xl font-bold text-text-primary">Course List</CardTitle>
              <Link to="/course/add">
                <Button className="bg-primary text-white font-semibold hover:bg-primary/90 transition-colors text-base py-2 px-4 w-full md:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Course
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow">
                  <Input
                    type="text"
                    placeholder="Search Course title..."
                    className="pl-10 p-2 w-full bg-input-bg text-input-text placeholder-input-placeholder border-input-border focus:border-input-borderFocus focus:ring-input-focusRing rounded-md"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select onValueChange={handleItemsPerPageChange} value={itemsPerPage.toString()}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Items per page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 per page</SelectItem>
                    <SelectItem value="12">12 per page</SelectItem>
                    <SelectItem value="24">24 per page</SelectItem>
                    <SelectItem value="30">30 per page</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  onClick={handleFilterClick}
                  className={cn(
                    "text-primary font-bold transition hover:bg-primary hover:text-white"
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
                          ? "bg-primary text-white hover:bg-primary/90"
                          : "text-primary border-primary hover:bg-primary/10 hover:text"
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
                            ? "bg-primary text-white hover:bg-primary/90"
                            : "text-primary border-primary hover:bg-primary/10"
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
            ) : courses.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                <p className="text-lg font-medium">No courses found</p>
                <p className="text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border-muted">
                <Table className="w-full">
                  <TableHeader className="bg-bg-secondary">
                    <TableRow className="hover:bg-bg-secondary/80">
                      <TableHead>
                        ID
                      </TableHead>
                      <TableHead
                        className="text-text-secondary font-semibold cursor-pointer"
                        onClick={() => handleSort("title")}
                      >
                        Title {sortBy === "title" && (sortOrder === "asc" ? "▲" : "▼")}
                      </TableHead>
                      <TableHead
                        className="text-text-secondary font-semibold cursor-pointer"
                        onClick={() => handleSort("numberOfParticipant")}
                      >
                        Participants{" "}
                        {sortBy === "numberOfParticipant" && (sortOrder === "asc" ? "▲" : "▼")}
                      </TableHead>
                      <TableHead
                        className="text-text-secondary font-semibold cursor-pointer"
                        onClick={() => handleSort("createdAt")}
                      >
                        Created At {sortBy === "createdAt" && (sortOrder === "asc" ? "▲" : "▼")}
                      </TableHead>
                      <TableHead>
                        Status
                      </TableHead>
                      <TableHead className="text-text-secondary font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow
                        key={course.id}
                        className="hover:bg-bg-secondary/30 transition-colors border-t border-border-muted"
                      >
                        <TableCell className="font-medium text-text-primary">{course.id}</TableCell>
                        <TableCell className="text-text-primary">{course.title}</TableCell>
                        <TableCell className="text-text-primary">
                          {course.numberOfParticipant}
                        </TableCell>
                        <TableCell>{course.createdAt}</TableCell>
                        <TableCell>{getStatusBadge(course.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="cursor-pointer"
                                onClick={() => onNavigate(`/course/edit/${course.id}`)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer"
                                onClick={() => onNavigate(`/course/${course.id}`)}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Detail
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

            {!isLoading && courses.length > 0 && (
              <div className="flex justify-center mt-6 gap-2">
                <Button
                  variant="ghost"
                  className="text-primary font-bold hover:bg-primary transition hover:text-primary-foreground"
                  onClick={() => handlePageChange(currentPage)}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, index) => {
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
                            "text-primary font-bold transition hover:bg-primary hover:text-primary-foreground",
                            currentPage === index && "bg-primary text-primary-foreground hover:bg-button-hover"
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
                  className="text-primary font-bold hover:bg-primary transition hover:text-white"
                  onClick={() => handlePageChange(currentPage + 2)}
                  disabled={currentPage === totalPages - 1}
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