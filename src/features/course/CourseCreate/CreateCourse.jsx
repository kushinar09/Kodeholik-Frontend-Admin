"use client"

import { GLOBALS } from "@/lib/constants"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { createCourse, getTopicsWithId } from "@/lib/api/course_api"
import { useAuth } from "@/provider/AuthProvider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ChevronDown, ChevronUp, Upload, X, AlertCircle } from "lucide-react"
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
import MarkdownEditor from "@/components/layout/markdown/MarkdownEditor"
import LoadingScreen from "@/components/layout/loading"
import { toast } from "sonner"

const formSchema = z.object({
  title: z.string().trim().min(10, "Title must be at least 10 characters").max(200, "Title must be less than 200 characters"),
  description: z
    .string().trim()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be less than 5000 characters"),
  topicIds: z.array(z.string()).min(1, "At least one topic must be selected"),
  status: z.enum(["ACTIVATED", "INACTIVATED"]),
  imageFile: z
    .instanceof(File, { message: "Image must be a file" })
    .optional()
    .refine((file) => !file || file.size <= 200 * 1024 * 1024, "Image file must be less than 200 MB")
})

function CreateCourse() {
  useEffect(() => {
    document.title = `Create Course - ${GLOBALS.APPLICATION_NAME}`
  }, [])

  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    topicIds: [],
    status: "ACTIVATED"
  })
  const [topics, setTopics] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isTopicsOpen, setIsTopicsOpen] = useState(false)
  const [topicSearch, setTopicSearch] = useState("")
  const [fieldErrors, setFieldErrors] = useState({
    title: "",
    description: "",
    topicIds: "",
    imageFile: ""
  })
  const [showSuccessDialog, setShowSuccessDialog] = useState(false) // New state for success dialog
  const { apiCall } = useAuth()

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await getTopicsWithId()
        const formattedTopics = Array.isArray(data)
          ? data.map((topic) => ({
            id: String(topic.id || topic),
            name: topic.name || topic
          }))
          : []
        setTopics(formattedTopics)
      } catch (error) {
        console.warn("Error fetching topics:", error)
        setTopics([])
      }
    }
    fetchTopics()
  }, [])

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const filteredTopics = topics.filter((topic) => topic.name.toLowerCase().includes(topicSearch.toLowerCase()))

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleTopicChange = (topicId) => {
    const stringTopicId = String(topicId)
    setFormData((prev) => ({
      ...prev,
      topicIds: prev.topicIds.includes(stringTopicId)
        ? prev.topicIds.filter((id) => id !== stringTopicId)
        : [...prev.topicIds, stringTopicId]
    }))
    // Clear topic error when user selects a topic
    if (fieldErrors.topicIds) {
      setFieldErrors((prev) => ({ ...prev, topicIds: "" }))
    }
  }

  const clearAllTopics = () => {
    setFormData((prev) => ({ ...prev, topicIds: [] }))
    setTopicSearch("")
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      if (imagePreview) URL.revokeObjectURL(imagePreview)
      setImagePreview(URL.createObjectURL(file))
      // Clear image error when user uploads a new image
      if (fieldErrors.imageFile) {
        setFieldErrors((prev) => ({ ...prev, imageFile: "" }))
      }
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setImageFile(file)
      if (imagePreview) URL.revokeObjectURL(imagePreview)
      setImagePreview(URL.createObjectURL(file))
      // Clear image error when user uploads a new image
      if (fieldErrors.imageFile) {
        setFieldErrors((prev) => ({ ...prev, imageFile: "" }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFieldErrors({
      title: "",
      description: "",
      topicIds: "",
      imageFile: ""
    })

    const courseData = {
      title: formData.title,
      description: formData.description,
      topicIds: formData.topicIds,
      status: formData.status,
      imageFile: imageFile || undefined
    }

    try {
      formSchema.parse(courseData)
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errors = {}
        validationError.errors.forEach((err) => {
          const field = err.path[0]
          errors[field] = err.message
        })
        setFieldErrors(errors)
        return
      }
      console.error("An unexpected validation error occurred")
      return
    }

    setLoading(true)
    try {
      await createCourse(courseData, apiCall)
      setShowSuccessDialog(true)
    } catch (error) {
      toast.error(error.message || "Failed to create course. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDialogClose = () => {
    setShowSuccessDialog(false)
    navigate("/course") // Navigate after closing the dialog
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      ACTIVATED: "bg-green-500",
      INACTIVATED: "bg-red-500"
    }
    return <Badge className={`${statusMap[status]} text-white`}>{status.toUpperCase()}</Badge>
  }

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, description: value }))
    // Clear description error when user edits the description
    if (fieldErrors.description) {
      setFieldErrors((prev) => ({ ...prev, description: "" }))
    }
  }

  return loading ? (
    <LoadingScreen loadingText="Creating" />
  ) : (
    <>
      <form onSubmit={handleSubmit} className="rounded-xl border bg-card text-card-foreground shadow mb-8 p-5">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-5">
              <div className="flex justify-between">
                <div className="w-2/3">
                  <h4 className="text-md font-semibold text-primary mb-4">Title</h4>
                  <Input
                    name="title"
                    className={`w-full ${fieldErrors.title ? "border-red-500" : ""}`}
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter title of course..."
                    required
                  />
                  {fieldErrors.title && <p className="text-red-500 text-sm mt-1">{fieldErrors.title}</p>}
                </div>
                <div className="flex items-center space-x-3">
                  <Label htmlFor="status" className="text-primary text-base font-semibold">
                    {getStatusBadge(formData.status)}
                  </Label>
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
                </div>
              </div>
              <Collapsible open={isTopicsOpen} onOpenChange={setIsTopicsOpen}>
                <h4 className="text-md font-semibold text-primary mb-4">Topics</h4>
                <CollapsibleTrigger asChild>
                  <div
                    className={`flex items-center justify-between w-full rounded-lg p-2 border ${fieldErrors.topicIds ? "border-red-500" : "border-gray-700"} hover:bg-gray-200/50 cursor-pointer`}
                  >
                    <span className="text-black text-sm font-medium">
                      {formData.topicIds.length > 0
                        ? `${formData.topicIds.length} topic(s) selected`
                        : "Select Topics (at least 1 required)"}
                    </span>
                    {isTopicsOpen ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </CollapsibleTrigger>
                {fieldErrors.topicIds && <p className="text-red-500 text-sm mt-1">{fieldErrors.topicIds}</p>}
                <CollapsibleContent className="space-y-4 border border-gray-700 rounded-lg p-4 mt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-black">Topics</h4>
                    <span onClick={clearAllTopics} className="cursor-pointer text-sm text-gray-400 hover:underline">
                      Clear All
                    </span>
                  </div>
                  <Input
                    placeholder="Search topics..."
                    value={topicSearch}
                    onChange={(e) => setTopicSearch(e.target.value)}
                  />
                  <div className="max-h-[6rem] overflow-y-auto overflow-x-hidden flex flex-wrap gap-3 pb-2">
                    {filteredTopics.length > 0 ? (
                      filteredTopics.map((topic) => (
                        <div
                          key={topic.id}
                          className="flex-shrink-0 flex items-center space-x-2 rounded-lg p-2 hover:bg-gray-200/50 border border-gray-700/50"
                        >
                          <Checkbox
                            id={`topic-${topic.id}`}
                            checked={formData.topicIds.includes(topic.id)}
                            onCheckedChange={() => handleTopicChange(topic.id)}
                          />
                          <Label htmlFor={`topic-${topic.id}`} className="text-black text-sm whitespace-nowrap">
                            {topic.name}
                          </Label>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">No topics found</span>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            <div className="lg:w-2/5 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-md font-semibold text-primary">Course Image</h4>
                <input type="file" id="imageUpload" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
              <div
                className={`w-full aspect-video rounded-lg border ${fieldErrors.imageFile ? "border-red-500" : "border-gray-700"} overflow-hidden flex flex-col items-center justify-center`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <img
                      loading="lazy"
                      src={imagePreview || "/placeholder.svg"}
                      alt="Course preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full hover:bg-gray-700 text-black hover:text-white"
                        onClick={() => document.getElementById("imageUpload").click()}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    {imageFile && (
                      <div className="absolute bottom-0 left-0 right-0 text-xs text-black p-2 truncate">
                        {imageFile.name} ({(imageFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center h-full w-full p-6 cursor-pointer"
                    onClick={() => document.getElementById("imageUpload").click()}
                  >
                    <Upload className="h-8 w-8 text-black mb-4" />
                    <p className="text-black text-center">
                      Drag and drop an image here
                      <br />
                      or click to browse
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-4 text-black border-gray-700"
                      onClick={() => document.getElementById("imageUpload").click()}
                    >
                      Select Image
                    </Button>
                  </div>
                )}
              </div>
              {fieldErrors.imageFile && <p className="text-red-500 text-sm">{fieldErrors.imageFile}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-md font-semibold text-primary">Description</h4>
            <div className={`h-[400px] ${fieldErrors.description ? "border border-red-500 rounded-md" : ""}`}>
              <MarkdownEditor value={formData.description} onChange={handleDescriptionChange} />
            </div>
            {fieldErrors.description && <p className="text-red-500 text-sm">{fieldErrors.description}</p>}
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-gray-800">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary text-white">
            Create Course
          </Button>
        </div>
      </form>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Course Created Successfully</DialogTitle>
            <DialogDescription>
              Your course &quot;{formData.title}&quot; has been created successfully!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleDialogClose}>Go to Courses</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CreateCourse
