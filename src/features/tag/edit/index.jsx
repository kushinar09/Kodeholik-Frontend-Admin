"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { z } from "zod"

// Define the Zod schema for form validation
const tagSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200, "Name must be less than 200 characters"),
  type: z.enum(["SKILL", "TOPIC", "LANGUAGE"], {
    required_error: "Type is required"
  }),
  level: z
    .enum(["FUNDAMENTAL", "INTERMEDIATE", "ADVANCED", null, ""])
    .nullable()
    .optional()
    .refine(
      (data) => {
        if (data && data.type === "SKILL" && (!data.level || data.level === "")) {
          return false
        }
        return true
      },
      {
        message: "Level is required for Skill type",
        path: ["level"]
      }
    )
})

export function EditTagDialog({ open, onOpenChange, onSubmit, tag, setTag }) {
  const [errors, setErrors] = useState({
    name: "",
    type: "",
    level: ""
  })

  const [types, setTypes] = useState([
    { key: "SKILL", name: "Skill" },
    { key: "TOPIC", name: "Topic" },
    { key: "LANGUAGE", name: "Language" }
  ])

  const [levels, setLevels] = useState([
    { key: "FUNDAMENTAL", name: "Fundamental" },
    { key: "INTERMEDIATE", name: "Intermediate" },
    { key: "ADVANCED", name: "Advanced" }
  ])

  const [isSkillType, setIsSkillType] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setTag((prev) => ({ ...prev, [name]: value }))
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    try {
      tagSchema.parse(tag)
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = {}
        error.errors.forEach((err) => {
          console.log(err.message)
          fieldErrors[err.path[0]] = err.message
        })
        setErrors(fieldErrors)
      }
      return false
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrors({ name: "", type: "", level: "" })

    if (!validateForm()) {
      return
    }

    const submissionTag = { ...tag }
    if (submissionTag.type !== "SKILL") {
      submissionTag.level = null
    }
    onSubmit(submissionTag)
  }

  useEffect(() => {
    if (tag.type === "SKILL") {
      setIsSkillType(true)
    } else {
      setIsSkillType(false)
    }
  }, [tag])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Tag</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="name"
                  name="name"
                  value={tag.name}
                  onChange={handleChange}
                  className={`${errors.name ? "border-red-500" : ""}`}
                  required
                  minLength={1}
                  maxLength={200}
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <div className="col-span-3 space-y-1">
                <Select
                  disabled
                  id="type"
                  name="type"
                  onValueChange={(value) => {
                    setTag((prev) => ({ ...prev, type: value }))
                    if (errors.type) {
                      setErrors((prev) => ({ ...prev, type: "" }))
                    }
                  }}
                  defaultValue={tag.type ? String(tag.type) : undefined}
                >
                  <SelectTrigger
                    style={{ height: "44px !important" }}
                    className={`h-10 w-full ${errors.type ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type.key} value={type.key}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-red-500 text-xs">{errors.type}</p>}
              </div>
            </div>

            <div className={`grid grid-cols-4 items-center gap-4 ${isSkillType ? "block" : "hidden"}`}>
              <Label htmlFor="level" className="text-right">
                Level
              </Label>
              <div className="col-span-3 space-y-1">
                <Select
                  id="level"
                  name="level"
                  onValueChange={(value) => {
                    setTag((prev) => ({ ...prev, level: value }))
                    if (errors.level) {
                      setErrors((prev) => ({ ...prev, level: "" }))
                    }
                  }}
                  defaultValue={tag.level ? String(tag.level) : undefined}
                >
                  <SelectTrigger
                    style={{ height: "44px !important" }}
                    className={`h-10 w-full ${errors.level ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level.key} value={level.key}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.level && <p className="text-red-500 text-xs">{errors.level}</p>}
              </div>
            </div>
            {/* Add inputs for languageSupports and problemRequests here */}
          </div>
          <DialogFooter>
            <Button type="submit">Edit Tag</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
