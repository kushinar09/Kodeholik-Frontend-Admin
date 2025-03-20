"use client"

import { GLOBALS } from "@/lib/constants"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getChapterList } from "@/lib/api/chapter_api"
import { createLesson } from "@/lib/api/lesson_api"
import { useAuth } from "@/provider/AuthProvider"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  DialogTitle
} from "@/components/ui/dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import CreateLessonVideo from "./components/CreateLessonVideo"
import CreateLessonDocument from "./components/CreateLessonDocument"
import MarkdownEditor from "@/components/layout/markdown/MarkdownEditor"
import CreateLessonLab from "./components/CreateLessonLab"
import YoutubeInput from "./components/YoutubeInput"

// Define the Zod schema for form validation
const formSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be less than 5000 characters"),
  chapterId: z.string().min(1, "A chapter must be selected"),
  displayOrder: z.number().int().min(1, "Display order must be at least 1"),
  type: z.enum(["VIDEO", "YOUTUBE", "DOCUMENT"], {
    message: "Type must be either VIDEO, YOUTUBE, or DOCUMENT"
  }),
  status: z.enum(["ACTIVATED", "INACTIVATED"]),
  attachedFile: z
    .instanceof(File, { message: "Attached file must be a file" })
    .optional()
    .refine(
      (file) => !file || file.size <= 100 * 1024 * 1024,
      "Attached file must be less than 100 MB"
    ),
  videoFile: z
    .instanceof(File, { message: "Video must be a file" })
    .optional()
    .refine(
      (file) => !file || file.size <= 500 * 1024 * 1024,
      "Video file must be less than 500 MB"
    )
    .refine(
      (file) => !file || file.type.startsWith("video/"),
      "File must be a video"
    )
})

function CreateLesson() {
  useEffect(() => {
    document.title = `Create Lesson - ${GLOBALS.APPLICATION_NAME}`
  }, [])

  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    chapterId: "",
    displayOrder: 1,
    type: "VIDEO",
    status: "ACTIVATED"
  })
  const [chapters, setChapters] = useState([])
  const [file, setFile] = useState(null) // Generic file state for video or attached file
  const [filePreview, setFilePreview] = useState(null) // Preview for video files
  const [isChaptersOpen, setIsChaptersOpen] = useState(false)
  const [chapterSearch, setChapterSearch] = useState("")
  const [error, setError] = useState(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const { apiCall } = useAuth()
  const [selectedProblems, setSelectedProblems] = useState([])
  const [youtubeUrl, setYoutubeUrl] = useState("")

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const data = await getChapterList()
        const chapterArray = Array.isArray(data?.content) ? data.content : []
        setChapters(chapterArray)
        setError(null)
      } catch (error) {
        console.error("Error fetching chapters:", error)
        setChapters([])
        setError(error.message || "Failed to fetch chapters")
      }
    }
    fetchChapters()
  }, [])

  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview)
      }
    }
  }, [filePreview])

  const filteredChapters = chapters.filter((chapter) =>
    (chapter.title || `Unnamed Chapter (ID: ${chapter.id})`)
      .toLowerCase()
      .includes(chapterSearch.toLowerCase())
  )

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "displayOrder" ? Number.parseInt(value) : value
    }))
  }

  const handleChapterChange = (chapterId) => {
    setFormData((prev) => ({ ...prev, chapterId }))
    setIsChaptersOpen(false)
  }

  const clearChapterSelection = () => {
    setFormData((prev) => ({ ...prev, chapterId: "" }))
    setChapterSearch("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const lessonData = {
      chapterId: Number(formData.chapterId),
      title: formData.title,
      description: formData.description,
      displayOrder: Number(formData.displayOrder),
      type: formData.type === "YOUTUBE" ? "VIDEO" : formData.type, // Gộp YOUTUBE thành VIDEO
      status: formData.status
    }

    try {
      const formDataPayload = new FormData()
      formDataPayload.append("chapterId", lessonData.chapterId)
      formDataPayload.append("title", lessonData.title)
      formDataPayload.append("description", lessonData.description)
      formDataPayload.append("displayOrder", lessonData.displayOrder)
      formDataPayload.append("type", lessonData.type) // Luôn là VIDEO hoặc DOCUMENT
      formDataPayload.append("status", lessonData.status)

      // Handle lesson type
      if (formData.type === "VIDEO" && file) {
        formDataPayload.append("videoType", "VIDEO_FILE")
        formDataPayload.append("videoFile", file)
      } else if (formData.type === "YOUTUBE" && youtubeUrl) {
        formDataPayload.append("videoType", "YOUTUBE")
        formDataPayload.append("youtubeUrl", youtubeUrl)
      } else if (formData.type === "DOCUMENT" && file) {
        formDataPayload.append("attachedFile", file)
      } else {
        throw new Error(
          `Please provide ${
            formData.type === "VIDEO"
              ? "a video file"
              : formData.type === "YOUTUBE"
                ? "a YouTube URL"
                : "a document file"
          } for this lesson type.`
        )
      }

      // Always include selected problems regardless of lesson type
      if (selectedProblems.length > 0) {
        selectedProblems.forEach((p) => {
          formDataPayload.append("problemIds", p.link)
        })
      }

      // Log the form data being sent
      console.log("Sending form data:")
      for (const [key, value] of formDataPayload.entries()) {
        if (key === "videoFile" || key === "attachedFile") {
          console.log(
            `${key}: [File] ${value.name}, size: ${(value.size / 1024).toFixed(
              2
            )} KB`
          )
        } else {
          console.log(`${key}: ${value}`)
        }
      }

      const result = await createLesson(formDataPayload, apiCall)
      console.log("Create lesson result:", result)
      setShowSuccessDialog(true)
    } catch (error) {
      console.error("Error creating lesson:", error)
      setError(error.message || "Failed to create lesson")
    }
  }

  const handleDialogClose = () => {
    setShowSuccessDialog(false)
    navigate("/lesson")
  }

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, "description": value }))
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      ACTIVATED: "bg-green-500",
      INACTIVATED: "bg-red-500"
    }

    return (
      <Badge className={`${statusMap[status]} text-white`}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border bg-card text-card-foreground shadow mb-8 p-5"
      >
        {error && (
          <div className="text-red-500 mb-4 p-3 bg-red-900/20 border border-red-800/50 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-5">
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Lesson Title"
              required
            />
            {/* <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Lesson Description"
              required
              className="h-40"
            /> */}
            <MarkdownEditor
              value={formData.description}
              onChange={handleDescriptionChange}
            />
            <Collapsible open={isChaptersOpen} onOpenChange={setIsChaptersOpen}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between w-full rounded-lg p-2 border border-gray-700 hover:bg-gray-700/50 cursor-pointer">
                  <span className="text-black text-sm font-medium">
                    {formData.chapterId
                      ? chapters.find(
                        (ch) => ch.id === Number.parseInt(formData.chapterId)
                      )?.title || "Selected Chapter"
                      : "Select Chapter (required)"}
                  </span>
                  {isChaptersOpen ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 border border-gray-700 rounded-lg p-4 mt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-black">Chapters</h4>
                  <span
                    onClick={clearChapterSelection}
                    className="cursor-pointer text-sm text-gray-400 hover:underline"
                  >
                    Clear Selection
                  </span>
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
                          checked={formData.chapterId === String(chapter.id)}
                          onCheckedChange={() =>
                            handleChapterChange(chapter.id)
                          }
                        />
                        <Label
                          htmlFor={`chapter-${chapter.id}`}
                          className="text-black text-sm whitespace-nowrap"
                        >
                          {chapter.title ||
                            `Unnamed Chapter (ID: ${chapter.id})`}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">
                      No chapters found
                    </span>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
            <div className="space-y-2">
              <Label className="text-black text-base font-medium">
                Display Order
              </Label>
              <Input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleChange}
                placeholder="Display Order"
                min="1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-black text-base font-medium">
                Lesson Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, type: value }))
                  setFile(null) // Reset file
                  setFilePreview(null) // Reset preview
                  setYoutubeUrl("") // Reset YouTube URL khi đổi type
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
              />
              <Label
                htmlFor="status"
                className="text-black text-base font-medium"
              >
                Status
              </Label>
              {getStatusBadge(formData.status)}
            </div>

            {/* Always display CreateLessonLab component */}
            <CreateLessonLab
              selectedProblems={selectedProblems}
              setSelectedProblems={setSelectedProblems}
            />
          </div>

          <div className="lg:w-2/5 space-y-4">
            {formData.type === "VIDEO" && (
              <CreateLessonVideo
                file={file}
                setFile={setFile}
                filePreview={filePreview}
                setFilePreview={setFilePreview}
              />
            )}
            {formData.type === "YOUTUBE" && (
              <YoutubeInput
                youtubeUrl={youtubeUrl}
                setYoutubeUrl={setYoutubeUrl}
              />
            )}
            {formData.type === "DOCUMENT" && (
              <CreateLessonDocument file={file} setFile={setFile} />
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-gray-800">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary text-white">
            Create Lesson
          </Button>
        </div>
      </form>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lesson Created Successfully</DialogTitle>
            <DialogDescription>
              Your lesson "{formData.title}" has been created successfully!
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
