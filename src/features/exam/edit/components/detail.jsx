"use client"

import { Button } from "@/components/ui/button"
import { DateTimePicker24hForm } from "@/components/ui/datetime-picker"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronRight } from "lucide-react"
import { useEffect } from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

const formSchema = z.object({
  title: z.string().trim().min(10, "Title must be at least 10 characters").max(200, "Title must be less than 200 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(5000, "Description must be less than 5000 characters"),
  startTime: z
    .date({ required_error: "Start time is required" })
    .refine((date) => date >= new Date(), {
      message: "Start time cannot be in the past"
    })
})

export function EditExamDetails({ onNext, formData, updateFormData }) {
  const [durations, setDurations] = useState([
    30,
    60,
    90,
    120
  ])
  const [formValues, setFormValues] = useState(formData.details || {})


  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: formData.details.title || "",
      description: formData.details.description,
      startTime: formData.details.startTime || new Date(),
      duration: formData.details.duration || "90" // Add this line
    }
  })
  const watchedValues = form.watch()
  const title = form.watch("title")
  const description = form.watch("description")
  const duration = form.watch("duration")

  useEffect(() => {
    const values = form.getValues()
    // Only update when non-date fields change to prevent continuous re-renders
    setFormValues((prev) => ({
      ...prev,
      title: values.title,
      description: values.description,
      duration: values.duration
      // Only include startTime when explicitly needed
    }))
  }, [title, description, duration])

  useEffect(() => {
    const subscription = form.watch((value) => {
      // This runs only when form values actually change
      const timeoutId = setTimeout(() => {
        setFormValues(value)
      }, 100) // 100ms debounce

      return () => clearTimeout(timeoutId)
    })

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe()
  }, [form])

  function onSubmit(values) {
    const currentValues = form.getValues()
    updateFormData(currentValues, "details")
    if (onNext) onNext(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-2xl font-bold">Exam Details</h2>

        <div className="space-y-4">
          <div className="flex items-center">
            <Label>Exam Code: </Label>
            <div className="ml-4">
              {formData.code}
            </div>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center">
              <Label>Created By: </Label>
              <div className="ml-4" style={{ display: "flex", alignItems: "center" }}>
                <img loading="lazy"
                  src={formData.createdBy?.avatar || "#"}
                  alt="avatar"
                  className="size-8 rounded-full mr-2 object-cover"
                />
                <span>{formData.createdBy.username}</span>
              </div>
            </div>
            <div className="flex items-center">
              <Label>Created At: </Label>
              <div className="ml-4">
                {formData.createdAt}
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center">
              <Label>Updated By: </Label>
              <div className="ml-4" style={{ display: "flex", alignItems: "center" }}>
                <img loading="lazy"
                  src={formData.updatedBy?.avatar || "#"}
                  alt="avatar"
                  className="size-8 rounded-full mr-2 object-cover"
                />
                <span>{formData.updatedBy.username}</span>
              </div>
            </div>
            <div className="flex items-center">
              <Label>Updated At: </Label>
              <div className="ml-4">
                {formData.updatedAt}
              </div>
            </div>
          </div>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exam Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter exam title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exam Description</FormLabel>
                <FormControl>
                  <div className="border rounded-md h-fit">
                    <Textarea value={field.value} onChange={field.onChange} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex  md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem className="h-full">
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <div className="border rounded-md h-fit">
                      <DateTimePicker24hForm value={field.value} onChange={field.onChange} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="w-full md:w-1/2">
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem className="h-full">
                  <FormLabel>Duration</FormLabel>

                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value ? String(field.value) : undefined}
                  >
                    <FormControl>
                      <SelectTrigger style={{ height: "44px !important" }} className="h-10">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {durations.map((duration) => (
                        <SelectItem key={duration} selected value={String(duration)}>
                          {duration} minutes
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" className="flex items-center">
                        Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  )
}