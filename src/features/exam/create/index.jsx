"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

export function CreateExamDialog({ open, onOpenChange, onSubmit }) {
  const [exam, setExam] = useState({
    title: "",
    description: "",
    startTime: Date.now(),
    endTime: Date.now() + 3600000, // 1 hour from now
    languageSupports: [],
    problemRequests: []
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setExam((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(exam)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Exam</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={exam.title}
                onChange={handleChange}
                className="col-span-3"
                required
                minLength={10}
                maxLength={200}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={exam.description}
                onChange={handleChange}
                className="col-span-3"
                required
                minLength={10}
                maxLength={5000}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime" className="text-right">
                Start Time
              </Label>
              <Input
                id="startTime"
                name="startTime"
                type="datetime-local"
                value={new Date(exam.startTime).toISOString().slice(0, 16)}
                onChange={(e) => setExam((prev) => ({ ...prev, startTime: new Date(e.target.value).getTime() }))}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right">
                End Time
              </Label>
              <Input
                id="endTime"
                name="endTime"
                type="datetime-local"
                value={new Date(exam.endTime).toISOString().slice(0, 16)}
                onChange={(e) => setExam((prev) => ({ ...prev, endTime: new Date(e.target.value).getTime() }))}
                className="col-span-3"
                required
              />
            </div>
            {/* Add inputs for languageSupports and problemRequests here */}
          </div>
          <DialogFooter>
            <Button type="submit">Create Exam</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

