import { useState, useEffect } from "react"
import { getLessonByChapterId } from "@/lib/api/lesson_api"
import { getChapterList } from "@/lib/api/chapter_api"
import { Link, useNavigate } from "react-router-dom"
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

function LessonList({ onNavigate }) {
  const [lessons, setLessons] = useState([])
  const [chapterId, setChapterId] = useState(null)
  const [chapters, setChapters] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [chapterSearchQuery, setChapterSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const [currentPage, setCurrentPage] = useState(0)
  const [sortBy, setSortBy] = useState("id")
  const [sortOrder, setSortOrder] = useState("asc")
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)
  const navigate = useNavigate()

  // Fetch chapters for filter
  useEffect(() => {
    document.title = `Lesson List - ${GLOBALS.APPLICATION_NAME}`
    const searchParams = new URLSearchParams(window.location.search)
    const id = searchParams.get("chapterId")

    const fetchChapters = async () => {
      try {
        const data = await getChapterList()
        const chapterArray = Array.isArray(data?.content) ? data.content : []
        setChapters(chapterArray)
        if (id && !(data.content.map(ch => ch.id).includes(Number(id)))) {
          navigate("/lesson")
        }
        if (id) {
          setChapterId(Number(id))
        } else if (chapterArray.length > 0) {
          setChapterId(chapterArray[0].id)
        }
      } catch (error) {
        console.error("Error fetching chapters:", error)
        setChapters([])
      }
    }
    fetchChapters()
  }, [])

  // Fetch lessons
  useEffect(() => {
    const fetchLessons = async () => {
      setIsLoading(true)
      try {
        const data = await getLessonByChapterId(chapterId)
        const lessonArray = Array.isArray(data) ? data : []
        setLessons(lessonArray)
      } catch (error) {
        console.error("Error fetching lessons:", error)
        setLessons([])
      } finally {
        setIsLoading(false)
      }
    }
    if (chapterId) fetchLessons()
  }, [chapterId])

  // Client-side sorting
  const sortedLessons = [...lessons].sort((a, b) => {
    const order = sortOrder === "asc" ? 1 : -1
    if (sortBy === "id") return order * (a.id - b.id)
    if (sortBy === "title") return order * (a.title.localeCompare(b.title))
    return 0
  })

  // Client-side search for lessons
  const filteredLessons = sortedLessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Client-side pagination
  const totalItems = filteredLessons.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedLessons = filteredLessons.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  )

  // Filter chapters based on search query in the filter
  const filteredChapters = chapters.filter((chapter) =>
    (chapter.title || `Unnamed Chapter (ID: ${chapter.id})`)
      .toLowerCase()
      .includes(chapterSearchQuery.toLowerCase())
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
    return (
      <Badge className={`${statusMap[status] || "bg-gray-500"} text-white`}>
        {status?.toUpperCase()}
      </Badge>
    )
  }

  // Get chapter title by chapterId
  const getChapterTitle = (chapterId) => {
    const chapter = chapters.find((ch) => ch.id === chapterId)
    return chapter?.title || "Unknown Chapter"
  }

  // Handle filter toggle
  const handleFilterClick = () => {
    setIsFilterExpanded(!isFilterExpanded)
  }

  // Handle chapter selection
  const handleChapterClick = (chapter) => {
    setChapterId(chapter.id)
    setIsFilterExpanded(false)
    setCurrentPage(0)
    setChapterSearchQuery("")
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <main className="flex-grow">
        <Card className="border-border-muted bg-bg-card shadow-lg">
          <CardHeader className="pb-4 border-b border-border-muted">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="text-xl font-bold text-text-primary">Lesson List</CardTitle>
              <Link to="/lesson/add">
                <Button className="bg-primary text-white font-semibold hover:bg-primary/90 transition-colors text-base py-2 px-4 w-full md:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Lesson
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
                    placeholder="Search lesson title..."
                    className="pl-10 p-2 w-full bg-input-bg text-input-text placeholder-input-placeholder border-input-border focus:border-input-borderFocus focus:ring-input-focusRing rounded-md"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div>
                  <Button
                    variant="ghost"
                    onClick={handleFilterClick}
                    className={cn(
                      "text-primary font-bold hover:bg-primary transition hover:text-white"
                    )}
                  >
                    Filter by Chapter
                    <span className="ml-2 text-sm">{isFilterExpanded ? "▲" : "▼"}</span>
                  </Button>
                </div>
              </div>

              {isFilterExpanded && (
                <div className="p-4 bg-bg-card border border-border-muted rounded-lg shadow-sm animate-in fade-in duration-200">
                  <h3 className="text-sm font-medium text-text-secondary mb-3">Filter by Chapter</h3>
                  <div className="relative mb-3">
                    <Input
                      type="text"
                      placeholder="Search chapter name..."
                      className="pl-10 p-2 w-full bg-input-bg text-input-text placeholder-input-placeholder border-input-border focus:border-input-borderFocus focus:ring-input-focusRing rounded-md"
                      value={chapterSearchQuery}
                      onChange={(e) => setChapterSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap max-h-40 overflow-y-auto">
                    {filteredChapters.length > 0 ? (
                      filteredChapters.map((chapter) => (
                        <Button
                          key={chapter.id}
                          variant={
                            chapterId === (chapter.id)
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => handleChapterClick(chapter)}
                          className={cn(
                            "text-sm",
                            chapterId === (chapter.id)
                              ? "bg-primary text-white hover:bg-primary/90"
                              : "text-primary border-primary hover:bg-primary/10"
                          )}
                        >
                          {chapter.title || `Unnamed Chapter (ID: ${chapter.id})`}
                        </Button>
                      ))
                    ) : (
                      <p className="text-sm text-text-secondary">No chapters found</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredLessons.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                <p className="text-lg font-medium">No lessons found</p>
                <p className="text-sm mt-2">Try adjusting your search or chapter selection</p>
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
                      <TableHead>Chapter Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-text-secondary font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLessons.map((lesson) => (
                      <TableRow
                        key={lesson.id}
                        className="hover:bg-bg-secondary/30 transition-colors border-t border-border-muted"
                      >
                        <TableCell className="font-medium text-text-primary">{lesson.id}</TableCell>
                        <TableCell className="text-text-primary">{lesson.title}</TableCell>
                        <TableCell className="text-text-primary">{getChapterTitle(lesson.chapterId)}</TableCell>
                        <TableCell className="text-text-primary">{lesson.type}</TableCell>
                        <TableCell>{getStatusBadge(lesson.status)}</TableCell>
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
                                onClick={() => onNavigate(`/lesson/${lesson.id}`)}
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

            {!isLoading && filteredLessons.length > 0 && (
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
                          "text-primary font-semibold transition",
                          currentPage === index ? "bg-primary text-primary-foreground" : "bg-transparent text-primary hover:bg-primary hover:text-primary-foreground"
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

export default LessonList