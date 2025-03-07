"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AlertDialog } from "./components/alert-dialog"
import { ProblemItem } from "./components/problem-item"
import { FilterBar } from "./components/filter-list"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const ITEMS_PER_PAGE = 10

export default function ProblemList({ onNavigate }) {
  const [problemData, setProblemData] = useState({
    content: [
      {
        title: "Keep Multiplying Found Values by Two",
        description:
          "You are given an array of integers nums. You are also given an integer original which is the first number that needs to be searched for in nums.\n\nYou then do the following steps:\n\nIf original is found in nums, multiply it by two (i.e., set original = 2 * original).\nOtherwise, stop the process.\nRepeat this process with the new number as long as you keep finding the number.\nReturn the final value of original.",
        link: "keep-multiplying-found-values-by-two",
        difficulty: "EASY",
        acceptanceRate: 0.0,
        noSubmission: 0.0,
        status: "PUBLIC",
        active: true,
      },
      {
        title: "Sum of Two Integers",
        description:
          "Given two integers a and b, return the sum of the two integers without using the operators + and -.",
        link: "sum-of-two-integers",
        difficulty: "EASY",
        acceptanceRate: 0.0,
        noSubmission: 0.0,
        status: "PUBLIC",
        active: true,
      },
      {
        title: "Power of Two",
        description:
          "Given an integer n, return true if it is a power of two. Otherwise, return false.\n\nAn integer n is a power of two, if there exists an integer x such that n == 2x.",
        link: "power-of-two",
        difficulty: "EASY",
        acceptanceRate: 0.0,
        noSubmission: 0.0,
        status: "PUBLIC",
        active: true,
      },
      {
        title: "Intersection of Two Arrays II",
        description:
          "Given two integer arrays nums1 and nums2, return an array of their intersection. Each element in the result must appear as many times as it shows in both arrays and you may return the result in any order.",
        link: "intersection-of-two-arrays-ii",
        difficulty: "EASY",
        acceptanceRate: 0.0,
        noSubmission: 0.0,
        status: "PUBLIC",
        active: true,
      },
      {
        title: "Number of Days Between Two Dates",
        description:
          "Write a program to count the number of days between two dates.\n\nThe two dates are given as strings, their format is YYYY-MM-DD as shown in the examples.",
        link: "number-of-days-between-two-dates",
        difficulty: "EASY",
        acceptanceRate: 0.0,
        noSubmission: 0.0,
        status: "PUBLIC",
        active: true,
      },
    ],
    pageable: {
      pageNumber: 0,
      pageSize: 5,
      sort: {
        empty: false,
        unsorted: false,
        sorted: true,
      },
      offset: 0,
      unpaged: false,
      paged: true,
    },
    last: false,
    totalElements: 10,
    totalPages: 2,
    size: 5,
    number: 0,
    sort: {
      empty: false,
      unsorted: false,
      sorted: true,
    },
    first: true,
    numberOfElements: 5,
    empty: false,
  })

  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)
  const [currentProblem, setCurrentProblem] = useState(null)
  const [alertAction, setAlertAction] = useState(null)
  const [filters, setFilters] = useState({
    page: 0,
    size: 5,
    title: "",
    difficulty: "EASY",
    status: "PUBLIC",
    isActive: true,
    sortBy: "noSubmission",
    ascending: true,
  })

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }))
  }

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 0, // Reset to first page when filters change
    }))
  }

  const handleToggleActive = (problem) => {
    setCurrentProblem(problem)
    setAlertAction(problem.active ? "deactivate" : "activate")
    setIsAlertDialogOpen(true)
  }

  const confirmToggleActive = () => {
    if (currentProblem) {
      // In a real application, you would call an API to update the problem status
      // For this example, we'll update the local state
      setProblemData((prev) => ({
        ...prev,
        content: prev.content.map((p) => (p.link === currentProblem.link ? { ...p, active: !p.active } : p)),
      }))
      setIsAlertDialogOpen(false)
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

      <FilterBar onFilterChange={handleFilterChange} filters={filters} />

      <div className="grid gap-4">
        {problemData.content.map((problem) => (
          <ProblemItem
            key={problem.link}
            problem={{
              ...problem,
              difficulty: problem.difficulty,
              link: problem.link,
            }}
            onEdit={() => onNavigate(`/problem/${problem.link}`)}
            onToggleActive={() => handleToggleActive(problem)}
          />
        ))}
      </div>

      {problemData.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => handlePageChange(Math.max(0, problemData.number - 1))}
                disabled={problemData.first}
              />
            </PaginationItem>
            {Array.from({ length: problemData.totalPages }).map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  href="#"
                  isActive={problemData.number === index}
                  onClick={() => handlePageChange(index)}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() => handlePageChange(Math.min(problemData.number + 1, problemData.totalPages - 1))}
                disabled={problemData.last}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
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

