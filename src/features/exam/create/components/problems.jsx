"use client"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { MultiSelect } from "@/features/problem/ProblemCreate/components/multi-select"
import { toast } from "sonner"
import { getPrivateProblemForExaminer } from "@/lib/api/exam_api"
import { useAuth } from "@/provider/AuthProvider"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ChevronLeft, ChevronRight, ChevronsUpDown, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

const formSchema = z.object({
  languageSupports: z.array(z.string()).min(1, "Language support cannot be empty"),
  problems: z.array(
    z.object({
      problemLink: z.string().trim().min(1, "Problem link cannot be empty"),
      points: z.coerce.number().min(1, "Points must be at least 1").max(10, "Points cannot exceed 10")
    })
  )
})
const mockPrivateProblem = {
  id: 0,
  title: "2",
  link: "2"
}
export function CreateExamProblems({ onNext, onPrevious, formData, updateFormData }) {
  const [formValues, setFormValues] = useState(formData.problems || {})
  const [availableLanguages, setAvailableLanguages] = useState(["Java", "C"])
  const [problemList, setProblemList] = useState([mockPrivateProblem])
  const { apiCall } = useAuth()
  const [selectedProblems, setSelectedProblems] = useState([])

  // Use an object to track open state for each problem dropdown
  const [openStates, setOpenStates] = useState({})

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      problems: [{ problemLink: "", points: 0 }]
    }
  })
  const fetchPrivateProblem = async () => {
    try {
      const data = await getPrivateProblemForExaminer(apiCall)
      setProblemList(data.length > 0 ? data : [mockPrivateProblem])
    } catch (error) {
      console.error("Error fetching exams:", error)
    }
  }

  useEffect(() => {
    fetchPrivateProblem()
  }, [])

  const problemsChanged = form.watch("problems")

  useEffect(() => {
    const values = form.getValues()
    setFormValues((prev) => ({
      ...prev,
      problemsChanged: values.problems
    }))
  }, [problemsChanged])

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name?.startsWith("problems") || type === "all") {
        const currentValues = form.getValues().problems
        handleProblemsChange(currentValues)
      }
    })

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe()
  }, [form])

  const addProblem = async () => {
    // Get current values
    const currentValues = form.getValues().problems
    // Check if all existing problems have both problemLink and points
    const allProblemsValid = currentValues.every(
      (problem) => problem.problemLink && problem.points > 0 && problem.points <= 10
    )

    if (allProblemsValid) {
      form.clearErrors("problems")
      form.setValue("problems", [...currentValues, { problemLink: undefined, points: undefined }])
    } else {
      await form.trigger("problems")
    }
  }

  const removeProblem = (index) => {
    const currentValues = form.getValues().problems
    if (currentValues.length > 1) {
      const newValues = [...currentValues]
      newValues.splice(index, 1)
      form.setValue("problems", newValues)
    }
  }

  function onSubmit(values) {
    const currentValues = form.getValues()
    let totalPoint = 0
    for (const value of currentValues.problems) {
      totalPoint += Number(value.points)
    }
    if (Number(totalPoint) != 10) {
      toast.error("Error", {
        description: "Total point of all problem in your exam must be 10",
        variant: "destructive"
      })
    } else {
      updateFormData(currentValues, "problems")
      if (onNext) onNext(values)
    }
  }

  const handleProblemsChange = (newValues) => {
    const problemExcluded = []
    for (const value of newValues) {
      problemExcluded.push(value.problemLink)
    }
    setSelectedProblems(problemExcluded)
  }

  // Helper function to handle open state for a specific dropdown
  const handleOpenChange = (index, isOpen) => {
    setOpenStates((prev) => ({
      ...prev,
      [index]: isOpen
    }))
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-2xl font-bold">Exam Problems</h2>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="languageSupports"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Language Supports</FormLabel>
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
          <div style={{ marginTop: "30px" }}>
            <div className="flex">
              <div>
                <p className="font-semibold">Problem List</p>
              </div>
              <div className="ml-2">
                <svg
                  onClick={addProblem}
                  className="h-6 w-6 text-black-500 cursor-pointer"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {" "}
                  <path stroke="none" d="M0 0h24v24H0z" /> <circle cx="12" cy="12" r="9" />{" "}
                  <line x1="9" y1="12" x2="15" y2="12" /> <line x1="12" y1="9" x2="12" y2="15" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Add problems to the exam as questions along with their points.
            </p>
          </div>
          <div className="space-y-6">
            {form.watch("problems").map((problem, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 p-4 rounded-lg border border-border bg-card/50 relative"
              >
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name={`problems.${index}.problemLink`}
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-sm font-medium">Problem</FormLabel>
                        <FormControl>
                          <Popover open={openStates[index]} onOpenChange={(isOpen) => handleOpenChange(index, isOpen)}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openStates[index]}
                                className={cn(
                                  "w-full justify-between transition-all",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? problemList.find((p) => p.link === field.value)?.title : "Select problem"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-full min-w-[240px]" align="start">
                              <Command>
                                <CommandInput placeholder="Search problem..." className="h-9" />
                                <CommandList>
                                  <CommandEmpty>No problem found.</CommandEmpty>
                                  <CommandGroup>
                                    {problemList.map((problemValue) => (
                                      <CommandItem
                                        key={problemValue.id}
                                        value={problemValue.link}
                                        disabled={
                                          selectedProblems.includes(problemValue.link) && field.value !== problemValue.link
                                        }
                                        onSelect={(currentValue) => {
                                          field.onChange(currentValue)
                                          handleOpenChange(index, false)
                                        }}
                                        className={cn(
                                          selectedProblems.includes(problemValue.link) && field.value !== problemValue.link
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                        )}
                                      >
                                        {problemValue.title}
                                        <Check
                                          className={cn(
                                            "ml-auto h-4 w-4",
                                            field.value === problemValue.link ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage className="text-xs font-medium text-destructive mt-1" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name={`problems.${index}.points`}
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-sm font-medium">Points</FormLabel>
                        <div className="relative">
                          <Input min="0" max="10" type="number" {...field} className="w-full pr-1" />
                        </div>
                        <FormMessage className="text-xs font-medium text-destructive mt-1" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-end md:items-center justify-center md:justify-start pb-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeProblem(index)}
                    className={cn(
                      "h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors",
                      form.watch("problems").length <= 1 && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={form.watch("problems").length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove problem</span>
                  </Button>
                </div>

                {/* Index number badge */}
                <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
              </div>
            ))}

            {/* Add problem button */}
            {/* <Button
              type="button"
              variant="outline"
              className="w-full border-dashed hover:border-primary hover:bg-primary/5 transition-colors"
              onClick={() => {
                window.location.href = "/problem/create"
              }}
            >
                Add Problem
            </Button> */}
          </div>
        </div>
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onPrevious} className="flex items-center">
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button type="submit" className="flex items-center">
                        Create
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  )
}

