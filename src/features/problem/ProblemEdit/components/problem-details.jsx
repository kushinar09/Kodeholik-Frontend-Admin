"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { MultiSelect } from "./multi-select"
import { ChevronRight } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ENDPOINTS } from "@/lib/constants"
import MarkdownEditor from "@/components/layout/markdown/MarkdownEditor"

const formSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(200, "Title must be less than 200 characters"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be less than 5000 characters"),
  status: z.enum(["PUBLIC", "PRIVATE"]),
  topics: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  isActive: z.boolean(),
  languageSupport: z.array(z.string()).min(1, "At least one language must be selected")
})

export function ProblemDetails({ formData, updateFormData, onNext }) {
  const [topics, setTopics] = useState([])
  const [skills, setKkills] = useState([])

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch(ENDPOINTS.GET_TOPICS_PROBLEM)
        const data = await response.json()
        setTopics(data)
      } catch (error) {
        console.error("Error fetching topics:", error)
      }
    }

    const fetchSkills = async () => {
      try {
        const response = await fetch(ENDPOINTS.GET_SKILLS_PROBLEM)
        const data = await response.json()
        setKkills(data)
      } catch (error) {
        console.error("Error fetching skills:", error)
      }
    }

    fetchTopics()
    fetchSkills()
  }, [])

  const availableLanguages = ["Java", "C"]

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: formData.details.title || "",
      difficulty: formData.details.difficulty || "EASY",
      description: formData.details.description || "",
      status: formData.details.status || "PRIVATE",
      topics: formData.details.topics || [],
      skills: formData.details.skills || [],
      isActive: formData.details.isActive !== undefined ? formData.details.isActive : true,
      languageSupport: formData.details.languageSupport || []
    }
  })

  const handleSubmit = (values) => {
    console.log("Problem Details submitting:", values)
    updateFormData(values, "details")
    onNext()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <h2 className="text-2xl font-bold">Problem Details</h2>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Problem Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter problem title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty Level</FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="EASY" id="easy" />
                      <Label htmlFor="easy" className="text-green-500 font-medium">
                        EASY
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="MEDIUM" id="medium" />
                      <Label htmlFor="medium" className="text-yellow-500 font-medium">
                        MEDIUM
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="HARD" id="hard" />
                      <Label htmlFor="hard" className="text-red-500 font-medium">
                        HARD
                      </Label>
                    </div>
                  </RadioGroup>
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
                <FormLabel>Problem Description</FormLabel>
                <FormControl>
                  <div className="border rounded-md h-fit">
                    <MarkdownEditor value={field.value} onChange={field.onChange} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="PUBLIC" id="public" />
                      <Label htmlFor="public">PUBLIC</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="PRIVATE" id="private" />
                      <Label htmlFor="private">PRIVATE</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="topics"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Topics</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={topics.map((topic) => ({ label: topic, value: topic }))}
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder="Select topics..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skills</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={skills.map((skill) => ({ label: skill, value: skill }))}
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder="Select skills..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel>Active</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="languageSupport"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Language Support</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={availableLanguages.map((lang) => ({ label: lang, value: lang }))}
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder="Select supported languages..."
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground mt-1">
                  Select languages that will be supported for this problem
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
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

