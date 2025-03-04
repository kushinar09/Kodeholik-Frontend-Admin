"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ENDPOINTS } from "@/lib/constants"
import { MultiSelect } from "./multi-select"
import MarkdownEditor from "@/components/layout/markdown/MarkdownEditor"

const formSchema = z.object({
  editorialTitle: z
    .string()
    .min(10, "Editorial title must be at least 10 characters")
    .max(200, "Editorial title must be less than 200 characters"),
  editorialTextSolution: z
    .string()
    .min(10, "Editorial solution must be at least 10 characters")
    .max(5000, "Editorial solution must be less than 5000 characters"),
  editorialSkills: z.array(z.string()).optional(),
  solutionCodes: z.array(
    z.object({
      language: z.string(),
      solutionCode: z.string().min(1, "Solution code is required")
    })
  )
})

export function Editorial({ formData, updateFormData, onNext, onPrevious }) {
  const [activeLanguage, setActiveLanguage] = useState(formData.details.languageSupport[0] || "")

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

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      editorialTitle: formData.editorial.editorialTitle || "",
      editorialTextSolution: formData.editorial.editorialTextSolution || "",
      editorialSkills: formData.editorial.editorialSkills || [],
      solutionCodes: formData.details.languageSupport.map((lang) => ({
        language: lang,
        solutionCode: ""
      }))
    }
  })

  // Fix the handleSubmit function to properly pass data to parent component
  // Replace the handleSubmit function with:
  const handleSubmit = (values) => {
    // Transform the data to match the parent component's expected structure
    const transformedData = {
      editorialTitle: values.editorialTitle,
      editorialTextSolution: values.editorialTextSolution,
      editorialSkills: values.editorialSkills,
      solutionCode: values.solutionCodes.map((code) => ({
        solutionLanguage: code.language,
        solutionCode: code.solutionCode
      }))
    }

    console.log("Editorial submitting:", transformedData)
    updateFormData(transformedData, "editorial")
    onNext()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <h2 className="text-2xl font-bold">Editorial</h2>

        <div className="space-y-6">
          <FormField
            control={form.control}
            name="editorialTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Editorial Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter editorial title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="editorialTextSolution"
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
            name="editorialSkills"
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

          {/* Solution Code Tabs */}
          <div className="space-y-4">
            <Label>Solution Code</Label>
            <Tabs value={activeLanguage} onValueChange={setActiveLanguage}>
              <TabsList className="w-full">
                {formData.details.languageSupport.map((language) => (
                  <TabsTrigger key={language} value={language} className="flex-1">
                    {language}
                  </TabsTrigger>
                ))}
              </TabsList>

              {formData.details.languageSupport.map((language, index) => (
                <TabsContent key={language} value={language}>
                  <Card>
                    <CardHeader>
                      <CardTitle>{language} Solution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name={`solutionCodes.${index}.solutionCode`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder={
                                  language === "Java"
                                    ? "public int[] twoSum(int[] nums, int target) {\n    // Write your solution here\n}"
                                    : "int* twoSum(int* nums, int numsSize, int target) {\n    // Write your solution here\n}"
                                }
                                className="font-mono min-h-[300px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onPrevious} className="flex items-center">
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button type="submit" className="flex items-center">
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  )
}

