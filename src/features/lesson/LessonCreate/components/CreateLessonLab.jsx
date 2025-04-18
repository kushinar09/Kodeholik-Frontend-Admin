"use client"
import { useState, useEffect } from "react"
import { Search, X, ChevronDown, ChevronUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination"
import { useAuth } from "@/provider/AuthProvider"
import { ENDPOINTS } from "@/lib/constants"
import { toast } from "sonner"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"

export default function CreateLessonLab({
  selectedProblems = [],
  setSelectedProblems
}) {
  const pageSize = 10
  const [isLoading, setIsLoading] = useState(false)
  const [problems, setProblems] = useState([])
  const [filters, setFilters] = useState({
    page: 0,
    size: pageSize,
    title: "",
    difficulty: null,
    status: null,
    isActive: true,
    sortBy: null,
    ascending: null
  })
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 0,
    first: true,
    last: false
  })
  const [isProblemsOpen, setIsProblemsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { apiCall } = useAuth()

  // Derive problemIds from selectedProblems
  const problemIds = selectedProblems.map((problem) => String(problem.link))

  const rowRenderer = ({ index, key, style }) => {
    const problem = problems[index]
    return (
      <div key={key} style={style} className="flex items-center space-x-2 ...">
        {/* Checkbox và Label */}
      </div>
    )
  }

  // Fetch problems when filters change
  useEffect(() => {
    fetchProblems()
  }, [filters])

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        title: searchTerm,
        page: 0
      }))
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchProblems = async () => {
    setIsLoading(true)

    try {
      const response = await apiCall(ENDPOINTS.POST_TEACHER_PROBLEMS_LIST, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(filters)
      })

      if (!response.ok) {
        toast.error("Error", {
          description:
            response.json().message ||
            `Failed to load problems. Catch error ${response.status}.`
        })
      }

      const text = await response.text()
      if (text && text.length > 0) {
        const data = JSON.parse(text)
        // Ensure each problem has a unique link
        const problemsWithUniqueLinks = (data.content || []).map(
          (problem, index) => ({
            ...problem,
            link: problem.link || `problem-${index}` // Fallback for missing or duplicate links
          })
        )
        setProblems(problemsWithUniqueLinks)
        setPagination({
          totalPages: data.totalPages || 1,
          currentPage: data.number || 0,
          first: data.first,
          last: data.last
        })
      } else {
        setProblems([])
        setPagination({
          totalPages: 1,
          currentPage: 0,
          first: true,
          last: true
        })
      }
    } catch (err) {
      toast.error("Error", {
        description: "Failed to load problems. Please try again."
      })
      setProblems([])
      setPagination({
        totalPages: 1,
        currentPage: 0,
        first: true,
        last: true
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle search input change with debounce
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  // Handle problem selection
  const handleSelectProblem = (problem) => {
    const problemLink = String(problem.link)

    const isSelected = problemIds.includes(problemLink)

    if (isSelected) {
      // Remove the problem
      setSelectedProblems(
        selectedProblems.filter((p) => String(p.link) !== problemLink)
      )
    } else {
      // Add the problem
      setSelectedProblems([...selectedProblems, problem])
    }
  }

  // Handle removing a selected problem
  const handleRemoveProblem = (e, problemId) => {
    e.stopPropagation()
    const problemIdStr = String(problemId)
    setSelectedProblems(
      selectedProblems.filter((p) => String(p.link) !== problemIdStr)
    )
  }

  // Clear all selected problems
  const clearProblemSelection = (e) => {
    e.stopPropagation()
    setSelectedProblems([])
    setSearchTerm("")
  }

  // Get color based on difficulty
  const getDifficultyColor = (difficulty) => {
    const colors = {
      EASY: "bg-green-500",
      MEDIUM: "bg-yellow-500",
      HARD: "bg-red-500"
    }
    return colors[difficulty] || "bg-gray-500"
  }

  // Handle page change
  const handlePageChange = (e, page) => {
    e.preventDefault()
    e.stopPropagation()
    setFilters((prev) => ({
      ...prev,
      page: page
    }))
  }

  // Check if a problem is selected
  const isProblemSelected = (problemId) => {
    const problemIdStr = String(problemId)
    return problemIds.includes(problemIdStr)
  }

  return (
    <div className="space-y-4">
      <Label className="text-primary text-base font-semibold">Select Problems</Label>

      <div className="relative rounded-lg space-y-4">
        <Collapsible open={isProblemsOpen} onOpenChange={setIsProblemsOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full rounded-lg p-2 border border-gray-700 hover:bg-gray-200/50 cursor-pointer">
              <span className="text-black text-sm font-medium">
                {selectedProblems.length > 0
                  ? `Selected ${selectedProblems.length} problems`
                  : "Select problems"}
              </span>
              {isProblemsOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="z-10 absolute top-10 w-full bg-background space-y-4 border border-gray-700 rounded-lg p-4 mt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-black">Problems</h4>
              {selectedProblems.length > 0 && (
                <span
                  onClick={(e) => clearProblemSelection(e)}
                  className="cursor-pointer text-sm text-gray-400 hover:underline"
                >
                  Clear All
                </span>
              )}
            </div>

            {/* Search input */}
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search problems..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={handleSearch}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Problems list */}
            <div className="max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : problems.length === 0 ? (
                <div className="flex justify-center items-center h-32 text-muted-foreground">
                  No problems found
                </div>
              ) : (
                <div className="space-y-2">
                  {problems.map((problem) => (
                    <div
                      key={problem.link || `problem-${Math.random()}`}
                      className="flex items-center space-x-2 rounded-lg p-2 hover:bg-gray-700/50 border border-gray-700/50"
                    >
                      <Checkbox
                        id={`problem-${problem.link || Math.random()}`}
                        checked={isProblemSelected(problem.link)}
                        onCheckedChange={() => handleSelectProblem(problem)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Label
                        htmlFor={`problem-${problem.link || Math.random()}`}
                        className="flex-1 text-black text-sm cursor-pointer"
                      >
                        <div className="font-medium truncate">
                          {problem.title || "Untitled Problem"}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            className={`${getDifficultyColor(
                              problem.difficulty
                            )} text-white`}
                          >
                            {problem.difficulty || "UNKNOWN"}
                          </Badge>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Pagination onClick={(e) => e.stopPropagation()}>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        if (!pagination.first) {
                          handlePageChange(e, pagination.currentPage - 1)
                        }
                      }}
                      className={pagination.first ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {/* Improved pagination with ellipsis */}
                  {Array.from({ length: pagination.totalPages }).map((_, index) => {
                    // Show limited page numbers with ellipsis for better UX
                    if (
                      pagination.totalPages <= 5 ||
                      index === 0 ||
                      index === pagination.totalPages - 1 ||
                      (index >= pagination.currentPage - 1 && index <= pagination.currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={`page-${index}`}>
                          <PaginationLink
                            href="#"
                            isActive={pagination.currentPage === index}
                            onClick={(e) => handlePageChange(e, index)}
                          >
                            {index + 1}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    } else if (
                      (index === 1 && pagination.currentPage > 3) ||
                      (index === pagination.totalPages - 2 && pagination.currentPage < pagination.totalPages - 2)
                    ) {
                      return (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <span className="flex h-9 w-9 items-center justify-center text-sm">...</span>
                        </PaginationItem>
                      )
                    }
                    return null
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        if (!pagination.last) {
                          handlePageChange(e, pagination.currentPage + 1)
                        }
                      }}
                      className={pagination.last ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Display selected problems */}
        {selectedProblems.length > 0 && (
          <div className="mt-2 p-3 border rounded-md bg-muted">
            <div className="flex flex-wrap gap-2">
              {selectedProblems.map((problem) => (
                <div
                  key={problem.link || `selected-${Math.random()}`}
                  className="flex items-center gap-1 bg-background rounded-md px-2 py-1 border"
                >
                  <span className="text-sm">
                    {problem.title || "Untitled Problem"}
                  </span>
                  <Badge
                    className={`${getDifficultyColor(
                      problem.difficulty
                    )} text-white text-xs`}
                  >
                    {problem.difficulty || "UNKNOWN"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-full"
                    onClick={(e) => {
                      handleRemoveProblem(e, problem.link)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
