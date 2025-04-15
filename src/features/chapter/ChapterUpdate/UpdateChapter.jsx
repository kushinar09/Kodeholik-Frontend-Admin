"use client"

import { GLOBALS } from "@/lib/constants"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { updateChapter, getChapter } from "@/lib/api/chapter_api"
import { getCourseSearch } from "@/lib/api/course_api"
import { useAuth } from "@/provider/AuthProvider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { z } from "zod"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, ArrowLeft, Save, CheckCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import MarkdownEditor from "@/components/layout/markdown/MarkdownEditor"
import { toast } from "sonner"
import LoadingScreen from "@/components/layout/loading"

// Define the Zod schema for form validation
const formSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(200, "Title must be less than 200 characters"),
  description: z
    .string().trim()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be less than 5000 characters"),
  displayOrder: z.number().min(0, "Display order must be a non-negative number"),
  status: z.enum(["ACTIVATED", "INACTIVATED"]),
  courseId: z
    .number({
      invalid_type_error: "Must be select a course"
    })
    .min(1, "A course must be selected")
})

function UpdateChapter() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { apiCall } = useAuth()

  useEffect(() => {
    document.title = `Update Chapter - ${GLOBALS.APPLICATION_NAME}`
  }, [])

  const [formData, setFormData] = useState(null)
  const [courses, setCourses] = useState([])
  const [isCoursesOpen, setIsCoursesOpen] = useState(false)
  const [courseSearch, setCourseSearch] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({
    title: "",
    description: "",
    displayOrder: "",
    courseId: ""
  })

  // Fetch courses for selection
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourseSearch(apiCall,{
          page: 0,
          size: 100,
          sortBy: "title",
          ascending: true
        })
        const formattedCourses = (data.content || []).map((course) => ({
          id: Number(course.id),
          title: course.title || `Unnamed Course (ID: ${course.id})`
        }))
        setCourses(formattedCourses)
      } catch (error) {
        console.warn("Error fetching courses:", error)
        setCourses([])
      }
    }
    fetchCourses()
  }, [])

  // Fetch chapter data only after courses are loaded
  useEffect(() => {
    const fetchChapter = async () => {
      if (!courses.length) return // Wait until courses are fetched
      try {
        const data = await getChapter(id)
        const chapterCourseId = Number(data.courseId || 0)
        const courseExists = courses.some((course) => course.id === chapterCourseId)

        // Handle invalid courseId
        if (chapterCourseId === 0 || !courseExists) {
          toast.error(`The chapter's course (ID: ${chapterCourseId}) is not available. Please select a valid course.`)
        }

        setFormData({
          title: data.title || "",
          description: data.description || "",
          displayOrder: data.displayOrder || 0,
          status: data.status || "ACTIVATED",
          courseId: chapterCourseId > 0 && courseExists ? chapterCourseId : null
        })
      } catch (error) {
        console.warn("Error fetching chapter:", error.message)
      }
    }
    fetchChapter()
  }, [id, courses])

  const filteredCourses = courses.filter((course) => course.title.toLowerCase().includes(courseSearch.toLowerCase()))

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "displayOrder" ? Number(value) : value
    }))
  }

  const handleCourseChange = (courseId) => {
    setFormData((prev) => ({
      ...prev,
      courseId: courseId
    }))
  }

  const clearCourseSelection = () => {
    setFormData((prev) => ({ ...prev, courseId: null }))
    setCourseSearch("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFieldErrors({
      title: "",
      description: "",
      displayOrder: "",
      courseId: ""
    })
    setIsSubmitting(true)

    const dataToValidate = {
      title: formData.title,
      description: formData.description,
      displayOrder: formData.displayOrder,
      status: formData.status,
      courseId: formData.courseId
    }

    try {
      formSchema.parse(dataToValidate)
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errors = {}
        validationError.errors.forEach((err) => {
          const field = err.path[0]
          errors[field] = err.message
        })
        setFieldErrors(errors)
        setIsSubmitting(false)
        return
      }
      setIsSubmitting(false)
      return
    }

    const chapterData = {
      courseId: formData.courseId,
      title: formData.title,
      description: formData.description,
      displayOrder: formData.displayOrder,
      status: formData.status
    }

    try {
      await updateChapter(id, chapterData, apiCall)
      setIsSuccessDialogOpen(true)
      setTimeout(() => {
        setIsSuccessDialogOpen(false)
        navigate(`/chapter?courseId=${formData.courseId}`)
      }, 2000)
    } catch (error) {
      toast.error(error.message || "Failed to update chapter")
      setIsSubmitting(false)
    }
  }

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, description: value }))
  }

  const getStatusBadge = (status) => {
    return status === "ACTIVATED" ? (
      <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">ACTIVATED</Badge>
    ) : (
      <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
        INACTIVATED
      </Badge>
    )
  }

  if (!formData) {
    return <LoadingScreen message="Loading chapter data..." />
  }

  return (
    <div className="container py-8 px-4 sm:px-6 pt-0">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8 rounded-full">
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Go back</span>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Update Chapter</h1>
      </div>

      <Card className="border-border/40 shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>Chapter Details</CardTitle>
          </div>
          <CardDescription>Update the chapter details below.</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold">
                Chapter Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a descriptive title for this chapter"
                className={`border-input/40 ${fieldErrors.title ? "border-red-500" : ""}`}
                required
                disabled={isSubmitting || isSuccessDialogOpen} // Disable during submission or success
              />
              {fieldErrors.title && <p className="text-sm text-red-500">{fieldErrors.title}</p>}
            </div>

            <Collapsible open={isCoursesOpen} onOpenChange={setIsCoursesOpen}>
              <h4 className="text-sm font-semibold pb-2">
                Course <span className="text-red-500">*</span>
              </h4>
              <CollapsibleTrigger asChild>
                <div
                  className={`flex items-center justify-between w-full rounded-lg p-2 border ${fieldErrors.courseId ? "border-red-500" : "border-gray-700"} hover:bg-gray-200/50 cursor-pointer`}
                >
                  <span className="text-black text-sm font-medium">
                    {formData.courseId
                      ? courses.find((c) => c.id === formData.courseId)?.title || "Course Selected"
                      : "Select a Course"}
                  </span>
                  {isCoursesOpen ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </CollapsibleTrigger>
              {fieldErrors.courseId && <p className="text-sm text-red-500 mt-1">{fieldErrors.courseId}</p>}
              <CollapsibleContent className="space-y-4 border border-gray-700 rounded-lg p-4 mt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-black">Choose a course</h4>
                  <span onClick={clearCourseSelection} className="cursor-pointer text-sm text-gray-400 hover:underline">
                    Clear Selection
                  </span>
                </div>
                <Input
                  placeholder="Search courses..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  disabled={isSubmitting || isSuccessDialogOpen}
                />
                <div className="max-h-[6rem] overflow-y-auto overflow-x-hidden flex flex-wrap gap-3 pb-2">
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                      <div
                        key={course.id}
                        className="flex-shrink-0 flex items-center space-x-2 rounded-lg p-2 hover:bg-gray-200/50 border border-gray-700/50"
                      >
                        <Checkbox
                          id={`course-${course.id}`}
                          checked={formData.courseId === course.id}
                          onCheckedChange={() => handleCourseChange(course.id)}
                          disabled={isSubmitting || isSuccessDialogOpen}
                        />
                        <Label htmlFor={`course-${course.id}`} className="text-black text-sm whitespace-nowrap">
                          {course.title}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">No courses found</span>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="displayOrder" className="text-sm font-semibold">
                  Display Order <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="displayOrder"
                  name="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className={`border-input/40 ${fieldErrors.displayOrder ? "border-red-500" : ""}`}
                  required
                  disabled={isSubmitting || isSuccessDialogOpen}
                />
                {fieldErrors.displayOrder && <p className="text-sm text-red-500">{fieldErrors.displayOrder}</p>}
                <p className="text-xs text-muted-foreground">Determines the order in which chapters appear</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Status</Label>
                <div className="flex items-center justify-between p-3 rounded-md border border-input/40 bg-background">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="status"
                      checked={formData.status === "ACTIVATED"}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: checked ? "ACTIVATED" : "INACTIVATED"
                        }))
                      }
                      disabled={isSubmitting || isSuccessDialogOpen}
                    />
                    <Label htmlFor="status" className="font-medium cursor-pointer">
                      {formData.status === "ACTIVATED" ? "Active" : "Inactive"}
                    </Label>
                  </div>
                  {getStatusBadge(formData.status)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formData.status === "ACTIVATED"
                    ? "Chapter will be visible to students"
                    : "Chapter will be hidden from students"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold">
                Description <span className="text-red-500">*</span>
              </Label>
              <div className={`h-[400px] ${fieldErrors.description ? "border border-red-500 rounded-md" : ""}`}>
                <MarkdownEditor value={formData.description} onChange={handleDescriptionChange} />
              </div>
              {fieldErrors.description && <p className="text-sm text-red-500">{fieldErrors.description}</p>}
            </div>
          </CardContent>

          <Separator className="my-2" />

          <CardFooter className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting || isSuccessDialogOpen}
            >
              Cancel
            </Button>
            <Button type="submit" className="gap-1" disabled={isSubmitting || isSuccessDialogOpen}>
              <Save className="h-4 w-4" />
              {isSubmitting ? "Updating..." : "Update Chapter"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Success Dialog */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Success
            </DialogTitle>
            <DialogDescription>
              Chapter updated successfully! You will be redirected to the chapter list shortly.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UpdateChapter
