"use client"

import { useState, useMemo } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AlertDialog } from "./components/alert-dialog"
import { ProblemItem } from "./components/problem-item"
import { FilterBar } from "./components/filter-list"
import { Checkbox } from "@/components/ui/checkbox"

const ITEMS_PER_PAGE = 10

export default function ProblemList({ onNavigate }) {
  const [problems, setProblems] = useState([
    {
      id: 1,
      title: "Two Sum",
      titleSearchAndSort: "Two Sum",
      difficulty: "Easy",
      acceptanceRate: 45.2,
      noSubmission: 12500,
      active: true,
      link: "two-sum",
      topics: ["Arrays", "Hash Table"],
      skills: ["Problem Solving", "Data Structures"]
    },
    {
      id: 2,
      title: "Reverse Linked List",
      titleSearchAndSort: "Reverse Linked List",
      difficulty: "Medium",
      acceptanceRate: 62.8,
      noSubmission: 8750,
      active: false,
      link: "reverse-linked-list",
      topics: ["Linked List", "Recursion"],
      skills: ["Data Structures", "Algorithms"]
    },
    {
      id: 3,
      title: "Binary Tree Maximum Path Sum",
      titleSearchAndSort: "Binary Tree Maximum Path Sum",
      difficulty: "Hard",
      acceptanceRate: 35.1,
      noSubmission: 5200,
      active: false,
      link: "binary-tree-maximum-path-sum",
      topics: ["Binary Tree", "DFS"],
      skills: ["Tree Traversal", "Dynamic Programming"]
    }
  ])

  const [showTags, setShowTags] = useState(false)
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)
  const [currentProblem, setCurrentProblem] = useState(null)
  const [alertAction, setAlertAction] = useState(null)
  const [filters, setFilters] = useState({
    search: "",
    difficulty: "",
    topics: [],
    skills: [],
    status: ""
  })
  const [currentPage, setCurrentPage] = useState(1)

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const matchesSearch = problem.title.toLowerCase().includes(filters.search.toLowerCase())
      const matchesDifficulty = !filters.difficulty || problem.difficulty === filters.difficulty
      const matchesTopics =
        filters.topics.length === 0 || filters.topics.every((topic) => problem.topics.includes(topic))
      const matchesSkills =
        filters.skills.length === 0 || filters.skills.every((skill) => problem.skills.includes(skill))
      const matchesStatus =
        !filters.status ||
        (filters.status === "active" && problem.active) ||
        (filters.status === "inactive" && !problem.active)

      return matchesSearch && matchesDifficulty && matchesTopics && matchesSkills && matchesStatus
    })
  }, [problems, filters])

  const pageCount = Math.ceil(filteredProblems.length / ITEMS_PER_PAGE)
  const paginatedProblems = filteredProblems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleToggleActive = (problem) => {
    setCurrentProblem(problem)
    setAlertAction(problem.active ? "deactivate" : "activate")
    setIsAlertDialogOpen(true)
  }

  const confirmToggleActive = () => {
    if (currentProblem) {
      setProblems(problems.map((p) => (p.id === currentProblem.id ? { ...p, active: !p.active } : p)))
      setIsAlertDialogOpen(false)
    }
  }

  const allTopics = Array.from(new Set(problems.flatMap((p) => p.topics)))
  const allSkills = Array.from(new Set(problems.flatMap((p) => p.skills)))
  const allDifficulties = Array.from(new Set(problems.map((p) => p.difficulty)))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Problems</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-tags"
              checked={showTags}
              onCheckedChange={() => setShowTags(!showTags)}
            />
            <Label htmlFor="show-tags">Show Tags</Label>
          </div>
          <Button onClick={() => onNavigate("/problem/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Button>
        </div>
      </div>

      <FilterBar
        difficulties={allDifficulties}
        topics={allTopics}
        skills={allSkills}
        onFilterChange={handleFilterChange}
      />

      <div className="grid gap-4">
        {paginatedProblems.map((problem) => (
          <ProblemItem
            key={problem.id}
            problem={problem}
            showTags={showTags}
            onEdit={() => onNavigate(`/problem/${problem.link}`)}
            onToggleActive={() => handleToggleActive(problem)}
          />
        ))}
      </div>

      {pageCount > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center">
            Page {currentPage} of {pageCount}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(pageCount, prev + 1))}
            disabled={currentPage === pageCount}
          >
            Next
          </Button>
        </div>
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

