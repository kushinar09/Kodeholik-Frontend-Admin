"use client"

import { Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function ProblemItem({ problem, showTags, onEdit, onToggleActive }) {
  const difficultyColor =
    {
      Easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
      Hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    }[problem.difficulty] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{problem.title}</h3>
              <Badge className={difficultyColor}>{problem.difficulty}</Badge>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Acceptance Rate: {problem.acceptanceRate.toFixed(1)}%</p>
              <p>Submissions: {problem.noSubmission.toLocaleString()}</p>
            </div>

            {showTags && (
              <>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-sm font-medium">Topics:</span>
                  {problem.topics.map((topic) => (
                    <Badge key={topic} variant="outline">
                      {topic}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-sm font-medium">Skills:</span>
                  {problem.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex gap-4 self-end md:self-center items-center">
            <div className="flex items-center space-x-2">
              <Switch id={`active-${problem.id}`} checked={problem.active} onCheckedChange={onToggleActive} />
              <Label htmlFor={`active-${problem.id}`}>Active</Label>
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

