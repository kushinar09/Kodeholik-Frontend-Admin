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
import { ENDPOINTS } from "@/lib/constants"
import { MultiSelect } from "./multi-select"
import MarkdownEditor from "@/components/layout/markdown/MarkdownEditor"
import CodeEditor from "@/components/layout/editor-code/CodeEditor"

const formSchema = z.object({
  editorialTitle: z
    .string().trim()
    .min(10, "Editorial title must be at least 10 characters")
    .max(200, "Editorial title must be less than 200 characters"),
  editorialTextSolution: z
    .string().trim()
    .min(10, "Editorial solution must be at least 10 characters")
    .max(5000, "Editorial solution must be less than 5000 characters"),
  editorialSkills: z.array(z.string()).optional(),
  solutionCodes: z.array(
    z.object({
      solutionLanguage: z.string(),
      solutionCode: z.string().trim().min(1, "Solution code is required")
    })
  )
})

export function Editorial({ formData, updateFormData, onNext, onPrevious }) {
  // Use formData.details.languageSupport if it exists and has items
  const languages =
    formData.details?.languageSupport && formData.details.languageSupport.length > 0
      ? formData.details.languageSupport
      : formData.editorial?.editorialDto?.solutionCodes
        ? formData.editorial.editorialDto.solutionCodes.map((code) => code.solutionLanguage)
        : []

  const initialLanguage = languages.length > 0 ? languages[0] : ""
  const [activeLanguage, setActiveLanguage] = useState(initialLanguage)

  const [topics, setTopics] = useState([])
  const [skills, setSkills] = useState([])

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
        setSkills(data)
      } catch (error) {
        console.error("Error fetching skills:", error)
      }
    }

    fetchTopics()
    fetchSkills()
  }, [])

  // Initialize form with existing data
  const getDefaultValues = () => {
    if (formData.editorial) {
      const editorialData = formData.editorial

      // Map solution codes to the expected format
      const solutionCodes = languages.map((lang) => {
        const existingCode = editorialData.solutionCodes.find((code) => code.solutionLanguage === lang)

        return {
          solutionLanguage: lang,
          solutionCode: existingCode?.solutionCode || ""
        }
      })

      return {
        editorialTitle: editorialData.editorialTitle || "",
        editorialTextSolution: editorialData.editorialTextSolution || "",
        editorialSkills: editorialData.editorialSkills || [],
        solutionCodes
      }
    }

    // Default values if no editorial data exists
    return {
      editorialTitle: "",
      editorialTextSolution: "",
      editorialSkills: [],
      solutionCodes: languages.map((lang) => ({
        solutionLanguage: lang,
        solutionCode: ""
      }))
    }
  }

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues()
  })

  // Update form when formData changes
  useEffect(() => {
    if (formData.editorial?.editorialDto) {
      form.reset(getDefaultValues())
    }
  }, [formData.editorial, form])

  // Watch for form changes and update parent formData
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (Object.keys(form.formState.dirtyFields).length > 0) {
        // Only update if form has been modified
        const formValues = form.getValues()
        // Extract input parameters from form values
        const transformedData = {
          editorialTitle: formValues.editorialTitle,
          editorialTextSolution: formValues.editorialTextSolution,
          editorialSkills: formValues.editorialSkills,
          solutionCodes: formValues.solutionCodes.map((code) => ({
            solutionLanguage: code.solutionLanguage,
            solutionCode: code.solutionCode
          }))
        }
        // Update the parent's formData with the new inputParameter array
        updateFormData(transformedData, "editorial")
      }
    })

    return () => subscription.unsubscribe()
  }, [form, updateFormData])

  const handleSubmit = (values) => {
    // Transform the data to match the parent component's expected structure
    const transformedData = {
      editorialDto: {
        editorialTitle: values.editorialTitle,
        editorialTextSolution: values.editorialTextSolution,
        editorialSkills: values.editorialSkills,
        solutionCodes: values.solutionCodes.map((code) => ({
          solutionLanguage: code.solutionLanguage,
          solutionCode: code.solutionCode
        }))
      }
    }

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
                <FormLabel>Problem Solution</FormLabel>
                <FormControl>
                  <div className="border rounded-md h-[400px] flex">
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
            <Tabs value={activeLanguage} onValueChange={setActiveLanguage} className="bg-muted rounded-md">
              <TabsList>
                {languages.map((language) => (
                  <TabsTrigger key={language} value={language} className="flex-1 min-w-24">
                    {language}
                  </TabsTrigger>
                ))}
              </TabsList>

              {languages.map((language, index) => {
                // Find the index in the form's solutionCodes array that matches this language
                const codeIndex = form.getValues().solutionCodes.findIndex((code) => code.solutionLanguage === language)
                return (
                  <TabsContent key={language} value={language} className="mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle>{language} Solution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name={`solutionCodes.${codeIndex}.solutionCode`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <CodeEditor
                                  className="min-h-[300px]"
                                  initialCode={field.value || ""}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                )
              })}
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

