"use client"

import { ENDPOINTS, GLOBALS } from "@/lib/constants"
import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { createLesson } from "@/lib/api/lesson_api"
import { useAuth } from "@/provider/AuthProvider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ChevronDown, ChevronUp } from "lucide-react"
import { z } from "zod"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CreateLessonVideo from "./components/CreateLessonVideo"
import CreateLessonDocument from "./components/CreateLessonDocument"
import MarkdownEditor from "@/components/layout/markdown/MarkdownEditor"
import CreateLessonLab from "./components/CreateLessonLab"
import YoutubeInput from "./components/YoutubeInput"
import { toast } from "sonner"

// Define the Zod schema for form validation
const formSchema = z
  .object({
    title: z
      .string()
      .min(10, "Title must be at least 10 characters")
      .max(200, "Title must be less than 200 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(5000, "Description must be less than 5000 characters"),
    chapterId: z.number({ required_error: "A chapter must be selected" }).int().positive("A chapter must be selected"),
    displayOrder: z.number().int().min(1, "Display order must be at least 1"),
    type: z.enum(["VIDEO", "YOUTUBE", "DOCUMENT"], {
      message: "Type must be either VIDEO, YOUTUBE, or DOCUMENT",
    }),
    status: z.enum(["ACTIVATED", "INACTIVATED"]),
    videoFile: z
      .instanceof(File, { message: "Video must be a file" })
      .nullable()
      .optional()
      .refine((file) => !file || file.size <= 500 * 1024 * 1024, "Video file must be less than 500 MB")
      .refine((file) => !file || file.type.startsWith("video/"), "File must be a video"),
    youtubeUrl: z.string().nullable().optional(),
    attachedFile: z
      .instanceof(File, { message: "Attached file must be a file" })
      .nullable()
      .optional()
      .refine((file) => !file || file.size <= 100 * 1024 * 1024, "Attached file must be less than 100 MB"),
  })
  .superRefine((data, ctx) => {
    // Type-specific validation
    if (data.type === "VIDEO" && !data.videoFile) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A video file is required for VIDEO type",
        path: ["videoFile"],
      })
    }

    if (data.type === "YOUTUBE" && (!data.youtubeUrl || data.youtubeUrl.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A YouTube URL is required for YOUTUBE type",
        path: ["youtubeUrl"],
      })
    }

    if (data.type === "DOCUMENT" && !data.attachedFile) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A document file is required for DOCUMENT type",
        path: ["attachedFile"],
      })
    }
  })

function CreateLesson() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { apiCall } = useAuth()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    chapterId: searchParams.get("chapterId") ? Number(searchParams.get("chapterId")) : null,
    displayOrder: 1,
    type: "VIDEO",
    status: "ACTIVATED",
  })
  const [chapters, setChapters] = useState([])
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [videoFile, setVideoFile] = useState(null)
  const [videoFilePreview, setVideoFilePreview] = useState(null)
  const [docFile, setDocFile] = useState(null)
  const [docFilePreview, setDocFilePreview] = useState(null)
  const [isChaptersOpen, setIsChaptersOpen] = useState(false)
  const [chapterSearch, setChapterSearch] = useState("")
  const [courseSearch, setCourseSearch] = useState("")
  const [errors, setErrors] = useState({})
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [message, setMessage] = useState("")
  const [selectedProblems, setSelectedProblems] = useState([])
  const [youtubeUrl, setYoutubeUrl] = useState("")

  useEffect(() => {
    document.title = `Create Lesson - ${GLOBALS.APPLICATION_NAME}`
  }, [])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await apiCall(ENDPOINTS.GET_COURSES)
        const data = await response.json()
        setCourses(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error fetching courses:", error)
        setCourses([])
        setErrors((prev) => ({
          ...prev,
          courses: "Failed to fetch courses",
        }))
      }
    }
    fetchCourses()
  }, [apiCall])

  useEffect(() => {
    return () => {
      if (videoFilePreview) URL.revokeObjectURL(videoFilePreview)
      if (docFilePreview) URL.revokeObjectURL(docFilePreview)
    }
  }, [videoFilePreview, docFilePreview])

  const fetchChapters = async (courseId) => {
    if (!courseId) return

    try {
      const response = await apiCall(ENDPOINTS.GET_CHAPTER_BY_COURSE_ID_LESS.replace(":id", courseId))
      const data = await response.json()
      setChapters(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching chapters:", error)
      setChapters([])
      setErrors((prev) => ({
        ...prev,
        chapters: "Failed to fetch chapters for this course",
      }))
    }
  }

  const filteredCourses = courses.filter((course) =>
    (course.title || `Unnamed Course (ID: ${course.id})`).toLowerCase().includes(courseSearch.toLowerCase()),
  )

  const filteredChapters = chapters.filter((chapter) =>
    (chapter.title || `Unnamed Chapter (ID: ${chapter.id})`).toLowerCase().includes(chapterSearch.toLowerCase()),
  )

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "displayOrder" ? Number(value) || 1 : value,
    }))
    setErrors((prev) => ({ ...prev, [name]: null }))
  }

  const handleChapterChange = (chapterId) => {
    setFormData((prev) => ({ ...prev, chapterId: Number(chapterId) }))
    setIsChaptersOpen(false)
    setErrors((prev) => ({ ...prev, chapterId: null }))
  }

  const handleCourseChange = (courseId) => {
    setSelectedCourse(courseId)
    setFormData((prev) => ({ ...prev, chapterId: null }))
    fetchChapters(courseId)
  }

  const clearChapterSelection = () => {
    setSelectedCourse(null)
    setChapters([])
    setFormData((prev) => ({ ...prev, chapterId: null }))
    setChapterSearch("")
    setCourseSearch("")
  }

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, description: value }))
    setErrors((prev) => ({ ...prev, description: null }))
  }

  const validateForm = () => {
    // Clear any previous errors
    setErrors({})

    const dataToValidate = {
      ...formData,
      videoFile: formData.type === "VIDEO" ? videoFile : null,
      youtubeUrl: formData.type === "YOUTUBE" ? youtubeUrl : null,
      attachedFile: docFile,
    }

    try {
      formSchema.parse(dataToValidate)
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = {}
        error.errors.forEach((err) => {
          fieldErrors[err.path[0]] = err.message
        })
        setErrors(fieldErrors)
      } else {
        toast.error("Error creating lesson:", {
          description: error.message,
        })
      }
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    if (!validateForm()) {
      return
    }

    const lessonData = {
      chapterId: Number(formData.chapterId),
      title: formData.title,
      description: formData.description,
      displayOrder: Number(formData.displayOrder),
      type: formData.type === "YOUTUBE" ? "VIDEO" : formData.type,
      status: formData.status,
    }

    try {
      const formDataPayload = new FormData()
      formDataPayload.append("chapterId", lessonData.chapterId)
      formDataPayload.append("title", lessonData.title)
      formDataPayload.append("description", lessonData.description)
      formDataPayload.append("displayOrder", lessonData.displayOrder)
      formDataPayload.append("type", lessonData.type)
      formDataPayload.append("status", lessonData.status)

      if (formData.type === "VIDEO" && videoFile) {
        formDataPayload.append("videoType", "VIDEO_FILE")
        formDataPayload.append("videoFile", videoFile)
      } else if (formData.type === "YOUTUBE" && youtubeUrl) {
        const videoIdMatch = youtubeUrl.match(
          /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube(?:-nocookie)?\.com|youtu\.be)\/(?:[\w-]+\?v=|embed\/|v\/)?([\w-]+)(?:\S+)?$/,
        )
        const videoId = videoIdMatch?.[1]
        if (!videoId) throw new Error("Invalid YouTube URL")

        formDataPayload.append("videoType", "YOUTUBE")
        formDataPayload.append("youtubeUrl", youtubeUrl)
      }

      // Only append attachedFile if it exists
      if (docFile) {
        formDataPayload.append("attachedFile", docFile)
      }

      if (selectedProblems.length > 0) {
        selectedProblems.forEach((p) => {
          formDataPayload.append("problemIds", p.link)
        })
      }

      const response = await createLesson(formDataPayload, apiCall)
      setMessage(response)
      setShowSuccessDialog(true)
    } catch (error) {
      toast.error("Error creating lesson:", {
        description: error.message || "Failed to create lesson",
      })
    }
  }

  const handleDialogClose = () => {
    setShowSuccessDialog(false)
    navigate(`/lesson?chapterId=${formData.chapterId}`)
  }

  const handleCancel = () => {
    navigate(`/lesson?chapterId=${formData.chapterId}`)
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      ACTIVATED: "bg-green-500",
      INACTIVATED: "bg-red-500",
    }
    return (
      <Badge className={`${statusMap[status]} text-background hover:${statusMap[status]}`}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="rounded-xl border bg-card text-card-foreground shadow mb-8 p-5">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-5">
            <div className="flex justify-between items-center">
              <div className="flex flex-1 flex-col gap-2 max-w-[500px]">
                <Label htmlFor="title" className="text-primary text-base font-semibold">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Lesson Title"
                  required
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>
              <div className="flex items-center space-x-3">
                {getStatusBadge(formData.status)}
                <Switch
                  id="status"
                  checked={formData.status === "ACTIVATED"}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: checked ? "ACTIVATED" : "INACTIVATED",
                    }))
                  }
                />
              </div>
            </div>

            <Collapsible open={isChaptersOpen} onOpenChange={setIsChaptersOpen}>
              <h4 className="text-md font-semibold text-primary mb-4">
                Chapter <span className="text-red-500">*</span>
              </h4>
              <CollapsibleTrigger asChild>
                <div className="flex justify-between items-center w-full rounded-lg p-2 px-3 border border-gray-700 hover:bg-gray-200/50 cursor-pointer">
                  <div className="flex-1 flex items-center space-x-2">
                    <span
                      className={`text-sm ${courses.find((c) => c.id === selectedCourse) ? "font-semibold text-primary" : "font-medium text-gray-400"}`}
                    >
                      {`${courses.find((c) => c.id === selectedCourse)?.title || "Selected Course"}`}
                    </span>
                    <span>{">"}</span>
                    <span
                      className={`text-sm ${chapters.length > 0 && chapters.find((ch) => ch.id === formData.chapterId) ? "font-semibold text-primary" : "font-medium text-gray-400"}`}
                    >
                      {`${chapters.length > 0 ? chapters.find((ch) => ch.id === formData.chapterId)?.title || "Selected Chapter" : "Not found"}`}
                    </span>
                  </div>
                  {isChaptersOpen ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </CollapsibleTrigger>
              {errors.chapterId && <p className="text-red-500 text-sm mt-1">{errors.chapterId}</p>}
              <CollapsibleContent className="space-y-4 border border-gray-700 rounded-lg p-4 mt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-primary">Select Course</h4>
                  <span
                    onClick={() => {
                      clearChapterSelection()
                      setCourseSearch("")
                    }}
                    className="cursor-pointer text-sm text-gray-400 hover:underline"
                  >
                    Clear Selection
                  </span>
                </div>
                <Input
                  placeholder="Search courses..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="mb-2"
                />
                <div className="max-h-[6rem] overflow-y-auto overflow-x-hidden flex flex-wrap gap-3 pb-2">
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                      <div
                        key={course.id}
                        className={`flex-shrink-0 flex items-center space-x-2 rounded-lg p-2 hover:bg-gray-700/50 border ${
                          selectedCourse === course.id ? "border-primary" : "border-gray-700/50"
                        }`}
                        onClick={() => handleCourseChange(course.id)}
                      >
                        <Label className="text-primary text-sm whitespace-nowrap cursor-pointer">
                          {course.title || `Unnamed Course (ID: ${course.id})`}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">No courses found</span>
                  )}
                </div>

                {selectedCourse && (
                  <>
                    <div className="flex items-center justify-between mt-4">
                      <h4 className="text-sm font-medium text-primary">Select Chapter</h4>
                    </div>
                    <Input
                      placeholder="Search chapters..."
                      value={chapterSearch}
                      onChange={(e) => setChapterSearch(e.target.value)}
                    />
                    <div className="max-h-[6rem] overflow-y-auto overflow-x-hidden flex flex-wrap gap-3 pb-2">
                      {filteredChapters.length > 0 ? (
                        filteredChapters.map((chapter) => (
                          <div
                            key={chapter.id}
                            className="flex-shrink-0 flex items-center space-x-2 rounded-lg p-2 hover:bg-gray-700/50 border border-gray-700/50"
                          >
                            <Checkbox
                              id={`chapter-${chapter.id}`}
                              checked={formData.chapterId === chapter.id}
                              onCheckedChange={() => handleChapterChange(chapter.id)}
                            />
                            <Label htmlFor={`chapter-${chapter.id}`} className="text-primary text-sm whitespace-nowrap">
                              {chapter.title || `Unnamed Chapter (ID: ${chapter.id})`}
                            </Label>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-400 text-sm">No chapters found for this course</span>
                      )}
                    </div>
                  </>
                )}
              </CollapsibleContent>
            </Collapsible>

            <div className="space-y-2">
              <Label className="text-primary text-base font-semibold">Display Order</Label>
              <Input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleChange}
                placeholder="Display Order"
                min="1"
                required
              />
              {errors.displayOrder && <p className="text-red-500 text-sm mt-1">{errors.displayOrder}</p>}
            </div>

            <CreateLessonLab selectedProblems={selectedProblems} setSelectedProblems={setSelectedProblems} />
          </div>

          <div className="lg:w-1/3 space-y-4">
            <div className="space-y-2">
              <Label className="text-black text-base font-semibold">Lesson Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, type: value }))
                  // Reset fields based on type
                  if (value === "VIDEO") {
                    setYoutubeUrl("")
                  } else if (value === "YOUTUBE") {
                    setVideoFile(null)
                    setVideoFilePreview(null)
                  } else if (value === "DOCUMENT") {
                    setVideoFile(null)
                    setVideoFilePreview(null)
                    setYoutubeUrl("")
                  }
                  setErrors((prev) => ({
                    ...prev,
                    videoFile: null,
                    youtubeUrl: null,
                    attachedFile: null,
                  }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIDEO">Video</SelectItem>
                  <SelectItem value="YOUTUBE">YouTube</SelectItem>
                  <SelectItem value="DOCUMENT">Document</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.type === "VIDEO" && (
              <>
                <div>
                  <CreateLessonVideo
                    file={videoFile}
                    setFile={(file) => {
                      setVideoFile(file)
                      setErrors((prev) => ({ ...prev, videoFile: null }))
                    }}
                    filePreview={videoFilePreview}
                    setFilePreview={setVideoFilePreview}
                  />
                  {errors.videoFile && <p className="text-red-500 text-sm mt-1">{errors.videoFile}</p>}
                </div>
                <div>
                  <CreateLessonDocument
                    file={docFile}
                    setFile={(file) => {
                      setDocFile(file)
                      setErrors((prev) => ({ ...prev, attachedFile: null }))
                    }}
                    filePreview={docFilePreview}
                    setFilePreview={setDocFilePreview}
                  />
                  {errors.attachedFile && <p className="text-red-500 text-sm mt-1">{errors.attachedFile}</p>}
                </div>
              </>
            )}
            {formData.type === "YOUTUBE" && (
              <>
                <div>
                  <YoutubeInput
                    youtubeUrl={youtubeUrl}
                    setYoutubeUrl={(url) => {
                      setYoutubeUrl(url)
                      setErrors((prev) => ({ ...prev, youtubeUrl: null }))
                    }}
                  />
                  {errors.youtubeUrl && <p className="text-red-500 text-sm mt-1">{errors.youtubeUrl}</p>}
                </div>
                <div>
                  <CreateLessonDocument
                    file={docFile}
                    setFile={(file) => {
                      setDocFile(file)
                      setErrors((prev) => ({ ...prev, attachedFile: null }))
                    }}
                    filePreview={docFilePreview}
                    setFilePreview={setDocFilePreview}
                  />
                  {errors.attachedFile && <p className="text-red-500 text-sm mt-1">{errors.attachedFile}</p>}
                </div>
              </>
            )}
            {formData.type === "DOCUMENT" && (
              <div>
                <CreateLessonDocument
                  file={docFile}
                  setFile={(file) => {
                    setDocFile(file)
                    setErrors((prev) => ({ ...prev, attachedFile: null }))
                  }}
                  filePreview={docFilePreview}
                  setFilePreview={setDocFilePreview}
                />
                {errors.attachedFile && <p className="text-red-500 text-sm mt-1">{errors.attachedFile}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-4">
          <h4 className="text-md font-semibold text-primary">
            Description <span className="text-red-500">*</span>
          </h4>
          <div className="h-[400px]">
            <MarkdownEditor value={formData.description} onChange={handleDescriptionChange} />
          </div>
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-gray-800">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary text-white">
            Create Lesson
          </Button>
        </div>
      </form>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alert</DialogTitle>
            <DialogDescription>
              {message || `Your lesson "${formData.title}" has been created successfully!`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleDialogClose}>Go to Lessons</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CreateLesson
