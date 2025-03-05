"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DateTimePicker24hForm } from "@/components/ui/datetime-picker"

export function EditExamDialog({ open, onOpenChange, exam, onSubmit }) {
  const [editedExam, setEditedExam] = useState({
    title: exam.title,
    description: "", // You might want to fetch this from the backend
    startTime: exam.startTime,
    endTime: exam.endTime,
    languageSupports: [], // You might want to fetch this from the backend
    problemRequests: [] // You might want to fetch this from the backend
  })

  useEffect(() => {
    setEditedExam({
      title: exam.title,
      description: "", // You might want to fetch this from the backend
      startTime: exam.startTime,
      endTime: exam.endTime,
      languageSupports: [], // You might want to fetch this from the backend
      problemRequests: [] // You might want to fetch this from the backend
    })
  }, [exam])

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditedExam((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(editedExam)
  }

  const handleStartDateChange = (datetime) => {
    setEditedExam((prev) => ({ ...prev, startTime: new Date(datetime).getTime() }))
  }

  const handleEndDateChange = (datetime) => {
    setEditedExam((prev) => ({ ...prev, endTime: new Date(datetime).getTime() }))
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Exam</DialogTitle>
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
                value={editedExam.title}
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
                value={editedExam.description}
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
              <div className="col-span-3">
                <DateTimePicker24hForm value={new Date(editedExam.startTime).toLocaleString()} onChange={handleStartDateChange} />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right">
                End Time
              </Label>
              <div className="col-span-3">
                <DateTimePicker24hForm value={new Date(editedExam.endTime).toLocaleString()} onChange={handleEndDateChange} />
              </div>
            </div>
            {/* Add inputs for languageSupports and problemRequests here */}
          </div>
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

