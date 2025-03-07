"use client"

import { Edit, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function ProblemItem({ problem, onEdit, onToggleActive }) {
  const difficultyMap = {
    EASY: "Easy",
    MEDIUM: "Medium",
    HARD: "Hard"
  }

  const displayDifficulty = difficultyMap[problem.difficulty] || problem.difficulty

  const difficultyColor =
    {
      Easy: "bg-green-300 text-green-800 dark:bg-green-900 dark:text-green-100",
      Medium: "bg-yellow-300 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
      Hard: "bg-red-300 text-red-800 dark:bg-red-900 dark:text-red-100"
    }[displayDifficulty] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{problem.title}</h3>
              <Badge variant="outline" className={difficultyColor}>{displayDifficulty}</Badge>
              <Badge variant="outline">{problem.status}</Badge>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Acceptance Rate: {(problem.acceptanceRate || 0).toFixed(1)}%</p>
              <p>Submissions: {(problem.noSubmission || 0).toLocaleString()}</p>
            </div>
          </div>

          <div className="flex gap-4 self-end md:self-center items-center">
            <div className="flex items-center space-x-2">
              <Switch id={`active-${problem.link}`} checked={problem.active} onCheckedChange={onToggleActive} />
              <Label htmlFor={`active-${problem.link}`}>Active</Label>
            </div>

            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

