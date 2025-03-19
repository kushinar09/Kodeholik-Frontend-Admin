import { GLOBALS } from "@/lib/constants";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getChapterList } from "@/lib/api/chapter_api";
import { useAuth } from "@/provider/AuthProvider";
import { updateLesson, getLessonById } from "@/lib/api/lesson_api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, ChevronUp } from "lucide-react";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import UpdateLessonVideo from "./components/UpdateLessonVideo";
import UpdateLessonDocument from "./components/UpdateLessonDocument";
import MarkdownEditor from "@/components/layout/markdown/MarkdownEditor";

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
  chapterId: z
    .string()
    .min(1, "A chapter must be selected"),
  displayOrder: z
    .number()
    .int()
    .min(1, "Display order must be at least 1"),
  type: z.enum(["VIDEO", "DOCUMENT"], { message: "Type must be either VIDEO or DOCUMENT" }),
  status: z.enum(["ACTIVATED", "INACTIVATED"]),
  attachedFile: z
    .instanceof(File, { message: "Attached file must be a file" })
    .optional()
    .refine((file) => !file || file.size <= 100 * 1024 * 1024, "Attached file must be less than 100 MB"),
  videoFile: z
    .instanceof(File, { message: "Video must be a file" })
    .optional()
    .refine((file) => !file || file.size <= 500 * 1024 * 1024, "Video file must be less than 500 MB")
    .refine((file) => !file || file.type.startsWith("video/"), "File must be a video"),
});

function UpdateLesson() {
  const { id } = useParams(); // Get the lesson ID from the URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    chapterId: "",
    displayOrder: 1,
    type: "VIDEO",
    status: "ACTIVATED",
  });
  const [chapters, setChapters] = useState([]);
  const [file, setFile] = useState(null); // Generic file state for either video or attached file
  const [filePreview, setFilePreview] = useState(null); // Preview for video files
  const [existingFileUrl, setExistingFileUrl] = useState(null); // URL of existing video or file
  const [isChaptersOpen, setIsChaptersOpen] = useState(false);
  const [chapterSearch, setChapterSearch] = useState("");
  const [error, setError] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { apiCall } = useAuth();

  // Fetch lesson data and chapters on mount
  useEffect(() => {
    document.title = `Update Lesson - ${GLOBALS.APPLICATION_NAME}`;

    const fetchData = async () => {
      try {
        // Fetch lesson data
        const lessonData = await getLessonById(id, apiCall);
        setFormData({
          title: lessonData.title || "",
          description: lessonData.description || "",
          chapterId: String(lessonData.chapterId) || "",
          displayOrder: lessonData.displayOrder || 1,
          type: lessonData.type || "VIDEO",
          status: lessonData.status || "ACTIVATED",
        });

        // Set existing file URL if available
        if (lessonData.type === "VIDEO" && lessonData.videoUrl) {
          setExistingFileUrl(lessonData.videoUrl);
          setFilePreview(lessonData.videoUrl);
        } else if (lessonData.type === "DOCUMENT" && lessonData.attachedFile) {
          setExistingFileUrl(lessonData.attachedFile);
        }

        // Fetch chapters
        const chapterData = await getChapterList();
        const chapterArray = Array.isArray(chapterData?.content) ? chapterData.content : [];
        setChapters(chapterArray);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to fetch lesson or chapters");
      }
    };
    fetchData();
  }, [id, apiCall]);

  useEffect(() => {
    return () => {
      if (filePreview && !existingFileUrl) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview, existingFileUrl]);

  const filteredChapters = chapters.filter((chapter) =>
    (chapter.title || `Unnamed Chapter (ID: ${chapter.id})`)
      .toLowerCase()
      .includes(chapterSearch.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "displayOrder" ? parseInt(value) : value,
    }));
  };

  const handleChapterChange = (chapterId) => {
    setFormData((prev) => ({ ...prev, chapterId }));
    setIsChaptersOpen(false);
  };

  const clearChapterSelection = () => {
    setFormData((prev) => ({ ...prev, chapterId: "" }));
    setChapterSearch("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const dataToValidate = {
      title: formData.title,
      description: formData.description,
      chapterId: formData.chapterId,
      displayOrder: formData.displayOrder,
      type: formData.type,
      status: formData.status,
      attachedFile: formData.type === "DOCUMENT" ? file : undefined,
      videoFile: formData.type === "VIDEO" ? file : undefined,
    };

    try {
      formSchema.parse(dataToValidate);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        setError(validationError.errors[0].message);
        return;
      }
      setError("An unexpected validation error occurred");
      return;
    }

    const lessonData = {
      chapterId: formData.chapterId,
      title: formData.title,
      description: formData.description,
      displayOrder: formData.displayOrder,
      type: formData.type,
      status: formData.status,
    };

    try {
      const formDataPayload = new FormData();
      formDataPayload.append("chapterId", lessonData.chapterId);
      formDataPayload.append("title", lessonData.title);
      formDataPayload.append("description", lessonData.description);
      formDataPayload.append("displayOrder", lessonData.displayOrder);
      formDataPayload.append("type", lessonData.type);
      formDataPayload.append("status", lessonData.status);
      if (formData.type === "DOCUMENT" && file) {
        formDataPayload.append("attachedFile", file);
      } else if (formData.type === "VIDEO" && file) {
        formDataPayload.append("videoFile", file);
      }
      const result = await updateLesson(id, formDataPayload, apiCall);
      console.log("Update lesson result:", result);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error updating lesson:", error);
      setError(error.message || "Failed to update lesson");
    }
  };

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, "description": value }));
  };

  const handleDialogClose = () => {
    setShowSuccessDialog(false);
    navigate("/lesson");
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      ACTIVATED: "bg-green-500",
      INACTIVATED: "bg-red-500",
    };
    return (
      <Badge className={`${statusMap[status]} text-white`}>
        {status.toUpperCase()}
      </Badge>
    );
  };

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
                      ? chapters.find((ch) => ch.id === parseInt(formData.chapterId))?.title || "Selected Chapter"
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
                          onCheckedChange={() => handleChapterChange(chapter.id)}
                        />
                        <Label
                          htmlFor={`chapter-${chapter.id}`}
                          className="text-black text-sm whitespace-nowrap"
                        >
                          {chapter.title || `Unnamed Chapter (ID: ${chapter.id})`}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">No chapters found</span>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
            <div className="space-y-2">
              <Label className="text-white text-base font-medium">Display Order</Label>
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
              <Label className="text-white text-base font-medium">Lesson Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, type: value }));
                  setFile(null); // Clear file when type changes
                  setFilePreview(null);
                  setExistingFileUrl(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIDEO">Video</SelectItem>
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
                    status: checked ? "ACTIVATED" : "INACTIVATED",
                  }))
                }
              />
              <Label htmlFor="status" className="text-white text-base font-medium">
                Status
              </Label>
              {getStatusBadge(formData.status)}
            </div>
          </div>

          <div className="lg:w-2/5 space-y-4">
            {formData.type === "VIDEO" ? (
              <UpdateLessonVideo
                file={file}
                setFile={setFile}
                filePreview={filePreview}
                setFilePreview={setFilePreview}
                existingFileUrl={existingFileUrl}
              />
            ) : (
              <UpdateLessonDocument
                file={file}
                setFile={setFile}
                existingFileUrl={existingFileUrl}
              />
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-gray-800">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary text-white">
            Update Lesson
          </Button>
        </div>
      </form>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lesson Updated Successfully</DialogTitle>
            <DialogDescription>
              Your lesson "{formData.title}" has been updated successfully!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleDialogClose}>Go to Lessons</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default UpdateLesson;