"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AlertDialog } from "./components/alert-dialog"
import { ProblemItem } from "./components/problem-item"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination"
import { useAuth } from "@/provider/AuthProvider"
import { FilterBar } from "./components/filter-list"
import { ENDPOINTS } from "@/lib/constants"
import { toast } from "sonner"

export default function ProblemList({ onNavigate }) {
  const [problemData, setProblemData] = useState({
    content: [],
    pageable: {
      pageNumber: 0,
      pageSize: 5,
      sort: {
        empty: false,
        unsorted: false,
        sorted: true
      },
      offset: 0,
      unpaged: false,
      paged: true
    },
    last: false,
    totalElements: 0,
    totalPages: 0,
    size: 5,
    number: 0,
    sort: {
      empty: false,
      unsorted: false,
      sorted: true
    },
    first: true,
    numberOfElements: 0,
    empty: false
  })
  const pageSize = 10

  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)
  const [currentProblem, setCurrentProblem] = useState(null)
  const [alertAction, setAlertAction] = useState(null)
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
  const [isLoading, setIsLoading] = useState(false)

  const { apiCall } = useAuth()

  useEffect(() => {
    const message = localStorage.getItem("toastMessage")
    if (message) {
      toast.success("Success", {
        description: message
      })
      localStorage.removeItem("toastMessage")
    }
  }, [])

  // Fetch problems when filters change
  useEffect(() => {
    fetchProblems()
  }, [filters])

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
          description: response.json().message || `Failed to load problems. Catch error ${response.status}.`
        })
      }
      const text = await response.text()
      if (text && text.length > 0) {
        const data = JSON.parse(text)
        setProblemData(data)
      } else setProblemData(null)
    } catch (err) {
      toast.error("Error", {
        description: "Failed to load problems. Please try again."
      })
      setProblemData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage
    }))
  }

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 0
    }))
  }

  const handleToggleActive = (problem) => {
    setCurrentProblem(problem)
    setAlertAction(problem.active ? "deactivate" : "activate")
    setIsAlertDialogOpen(true)
  }

  const confirmToggleActive = async () => {
    if (currentProblem) {
      setIsLoading(true)
      try {
        const url = currentProblem.active ? ENDPOINTS.PUT_CHANGE_STATUS_PROBLEM_DEACTIVE : ENDPOINTS.PUT_CHANGE_STATUS_PROBLEM_ACTIVE
        // Call API to toggle problem active status
        const response = await apiCall(url.replace(":id", currentProblem.link), {
          method: "PUT"
        })

        if (!response.ok) {
          throw new Error("Failed to update problem status")
        } else {
          toast.success("Success", {
            description: "Change problem status successfully."
          })
        }
        // Refresh problem list
        fetchProblems()
      } catch (err) {
        toast.error("Error", {
          description: "Error updating problem status: " + (err.message || "Failed to load problems. Please try again.")
        })
      } finally {
        setIsLoading(false)
        setIsAlertDialogOpen(false)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Problems</h2>
        <div className="flex items-center space-x-4">
          <Button onClick={() => onNavigate("/problem/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Button>
        </div>
      </div>

      <FilterBar onFilterChange={handleFilterChange} initialFilters={filters} pageSize={pageSize} />

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {!problemData || problemData.content.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No problems found. Try adjusting your filters.</div>
          ) : (
            <div className="grid gap-4">
              {problemData.content.map((problem) => (
                <ProblemItem
                  key={problem.link}
                  problem={{
                    ...problem,
                    difficulty: problem.difficulty,
                    link: problem.link
                  }}
                  onEdit={() => onNavigate(`/problem/${problem.link}`)}
                  onToggleActive={() => handleToggleActive(problem)}
                />
              ))}
            </div>
          )}

          {problemData && problemData.totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      handlePageChange(Math.max(0, problemData.number - 1))
                    }}
                    disabled={problemData.first}
                  />
                </PaginationItem>
                {Array.from({ length: problemData.totalPages }).map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      href="#"
                      isActive={problemData.number === index}
                      className={problemData.number === index ? "bg-primary text-primary-foreground" : ""}
                      onClick={(e) => {
                        e.preventDefault()
                        handlePageChange(index)
                      }}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      handlePageChange(Math.min(problemData.number + 1, problemData.totalPages - 1))
                    }}
                    disabled={problemData.last}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      <AlertDialog
        open={isAlertDialogOpen}
        onOpenChange={setIsAlertDialogOpen}
        title={`${alertAction === "activate" ? "Activate" : "Deactivate"} Problem`}
        description={`Are you sure you want to ${alertAction === "activate" ? "activate" : "deactivate"} this problem?`}
        onConfirm={confirmToggleActive}
      />
    </div>
  )
}

