"use client";

import { GLOBALS } from "@/lib/constants";
import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getChapterList } from "@/lib/api/chapter_api";
import { useAuth } from "@/provider/AuthProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, ChevronUp } from "lucide-react";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UpdateLessonVideo from "./components/UpdateLessonVideo";
import UpdateLessonDocument from "./components/UpdateLessonDocument";
import UpdateLessonLab from "./components/UpdateLessonLab";
import YoutubeInput from "./components/YoutubeInput";
import MarkdownEditor from "@/components/layout/markdown/MarkdownEditor";
import { ENDPOINTS } from "@/lib/constants";

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
    message: "Type must be either VIDEO, YOUTUBE, or DOCUMENT",
  }),
  status: z.enum(["ACTIVATED", "INACTIVATED"]),
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
    ),
  youtubeUrl: z.string().optional(),
  attachedFile: z
    .instanceof(File, { message: "Attached file must be a file" })
    .optional()
    .refine(
      (file) => !file || file.size <= 100 * 1024 * 1024,
      "Attached file must be less than 100 MB"
    ),
});

function UpdateLesson() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { apiCall } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    chapterId: searchParams.get("chapterId") || "",
    displayOrder: 1,
    type: "VIDEO",
    status: "ACTIVATED",
  });
  const [chapters, setChapters] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoFilePreview, setVideoFilePreview] = useState(null);
  const [docFile, setDocFile] = useState(null);
  const [docFilePreview, setDocFilePreview] = useState(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState(null);
  const [existingDocUrl, setExistingDocUrl] = useState(null);
  const [isChaptersOpen, setIsChaptersOpen] = useState(false);
  const [chapterSearch, setChapterSearch] = useState("");
  const [errors, setErrors] = useState({});
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = `Update Lesson - ${GLOBALS.APPLICATION_NAME}`;
    fetchLessonDetail();
    fetchChapters();
  }, []);

  const fetchLessonDetail = async () => {
    try {
      const response = await apiCall(
        `${ENDPOINTS.GET_LESSON_DETAIL.replace(":id", id)}`,
        { method: "GET" }
      );
      const data = await response.json();
      const lessonType =
        data.type === "VIDEO" && data.videoUrl && isYouTubeKey(data.videoUrl)
          ? "YOUTUBE"
          : data.type || "VIDEO";
      setFormData({
        title: data.title || "",
        description: data.description || "",
        chapterId:
          String(data.chapterId) || searchParams.get("chapterId") || "",
        displayOrder: data.displayOrder || 1,
        type: lessonType,
        status: data.status || "ACTIVATED",
      });
      const formattedProblems = (data.problems || []).map((problem) => ({
        link: problem.problemLink,
        title: problem.title || problem.problemLink,
        difficulty: problem.difficulty || "UNKNOWN",
      }));
      setSelectedProblems(formattedProblems);
      if (lessonType === "YOUTUBE") {
        setYoutubeUrl("https://www.youtube.com/watch?v=" + data.videoUrl);
      } else if (lessonType === "VIDEO" && data.videoUrl) {
        setExistingVideoUrl(data.videoUrl);
        setVideoFilePreview(data.videoUrl);
      }
      if (data.attachedFile) {
        setExistingDocUrl(data.attachedFile);
        setDocFilePreview(data.attachedFile);
      }
      setIsLoading(false);
    } catch (err) {
      setErrors({ general: err.message || "Failed to load lesson details" });
      setIsLoading(false);
    }
  };

  const isYouTubeKey = (url) => {
    return (
      url && url.length === 11 && !url.includes("/") && !url.startsWith("http")
    );
  };

  const fetchChapters = async () => {
    try {
      const data = await getChapterList();
      setChapters(Array.isArray(data?.content) ? data.content : []);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        chapters: err.message || "Failed to fetch chapters",
      }));
    }
  };

  useEffect(() => {
    return () => {
      if (videoFilePreview && videoFilePreview.startsWith("blob:")) {
        URL.revokeObjectURL(videoFilePreview);
      }
      if (docFilePreview && docFilePreview.startsWith("blob:")) {
        URL.revokeObjectURL(docFilePreview);
      }
    };
  }, [videoFilePreview, docFilePreview]);

  const filteredChapters = chapters.filter((chapter) =>
    (chapter.title || `Unnamed Chapter (ID: ${chapter.id})`)
      .toLowerCase()
      .includes(chapterSearch.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "displayOrder" ? Number(value) || 1 : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleChapterChange = (chapterId) => {
    setFormData((prev) => ({ ...prev, chapterId }));
    setIsChaptersOpen(false);
    setErrors((prev) => ({ ...prev, chapterId: null }));
  };

  const clearChapterSelection = () => {
    setFormData((prev) => ({ ...prev, chapterId: "" }));
    setChapterSearch("");
  };

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, description: value }));
    setErrors((prev) => ({ ...prev, description: null }));
  };

  const validateForm = () => {
    const dataToValidate = {
      ...formData,
      videoFile,
      youtubeUrl,
      attachedFile: docFile,
    };

    try {
      formSchema.parse(dataToValidate);
      // Additional validation for required fields based on type
      if (formData.type === "VIDEO" && !videoFile && !existingVideoUrl) {
        throw new Error("A video file is required for VIDEO type");
      }
      if (
        formData.type === "YOUTUBE" &&
        (!youtubeUrl || youtubeUrl.trim() === "") &&
        !existingVideoUrl
      ) {
        throw new Error("A YouTube URL is required for YOUTUBE type");
      }
      if (formData.type === "DOCUMENT" && !docFile && !existingDocUrl) {
        throw new Error("A document file is required for DOCUMENT type");
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = {};
        error.errors.forEach((err) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: error.message });
      }
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    const lessonData = {
      chapterId: Number(formData.chapterId),
      title: formData.title,
      description: formData.description,
      displayOrder: Number(formData.displayOrder),
      type: formData.type === "YOUTUBE" ? "VIDEO" : formData.type,
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

      if (formData.type === "VIDEO" && videoFile) {
        formDataPayload.append("videoType", "VIDEO_FILE");
        formDataPayload.append("videoFile", videoFile);
      } else if (formData.type === "YOUTUBE" && youtubeUrl) {
        const videoId = youtubeUrl.match(
          /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        )?.[1];
        if (!videoId) throw new Error("Invalid YouTube URL");
        formDataPayload.append("videoType", "YOUTUBE");
        formDataPayload.append("youtubeUrl", videoId);
      } else if (formData.type === "DOCUMENT" && docFile) {
        formDataPayload.append("attachedFile", docFile);
      }

      if (
        (formData.type === "VIDEO" || formData.type === "YOUTUBE") &&
        docFile
      ) {
        formDataPayload.append("attachedFile", docFile);
      }

      if (selectedProblems.length > 0) {
        selectedProblems.forEach((p) => {
          formDataPayload.append("problemIds", p.link);
        });
      }

      const url = ENDPOINTS.UPDATE_LESSON.replace(":id", id);
      const response = await apiCall(url, {
        method: "PUT",
        body: formDataPayload,
      });

      if (!response.ok) throw new Error("Failed to update lesson");
      setShowSuccessDialog(true);
    } catch (err) {
      setErrors({ general: err.message || "Failed to update lesson" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = () => {
    setShowSuccessDialog(false);
    navigate(`/lesson?chapterId=${formData.chapterId}`);
  };

  const handleCancel = () => {
    navigate(`/lesson?chapterId=${formData.chapterId}`);
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

  if (isLoading) {
    return <div>Loading lesson details...</div>;
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border bg-card text-card-foreground shadow mb-8 p-5"
      >
        {errors.general && (
          <div className="text-red-500 mb-4 p-3 bg-red-900/20 border border-red-800/50 rounded-lg">
            {errors.general}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-5">
            <div>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Lesson Title"
                required
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-md font-semibold text-primary">
                Description
              </h4>
              <div className="h-[400px]">
                <MarkdownEditor
                  value={formData.description}
                  onChange={handleDescriptionChange}
                />
              </div>
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <Collapsible open={isChaptersOpen} onOpenChange={setIsChaptersOpen}>
              <h4 className="text-md font-semibold text-primary mb-4">
                Chapter
              </h4>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between w-full rounded-lg p-2 border border-gray-700 hover:bg-gray-700/50 cursor-pointer">
                  <span className="text-primary text-sm font-medium">
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
              {errors.chapterId && (
                <p className="text-red-500 text-sm mt-1">{errors.chapterId}</p>
              )}
              <CollapsibleContent className="space-y-4 border border-gray-700 rounded-lg p-4 mt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-primary">Chapters</h4>
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
                          className="text-primary text-sm whitespace-nowrap"
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
              <Label className="text-primary text-base font-semibold">
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
              {errors.displayOrder && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.displayOrder}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-black text-base font-medium">
                Lesson Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, type: value }));
                  setVideoFile(null);
                  setVideoFilePreview(existingVideoUrl || null);
                  setDocFile(null);
                  setDocFilePreview(existingDocUrl || null);
                  setYoutubeUrl(value === "YOUTUBE" ? youtubeUrl : "");
                  setErrors((prev) => ({
                    ...prev,
                    videoFile: null,
                    youtubeUrl: null,
                    attachedFile: null,
                  }));
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
                    status: checked ? "ACTIVATED" : "INACTIVATED",
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

            <UpdateLessonLab
              selectedProblems={selectedProblems}
              setSelectedProblems={setSelectedProblems}
            />
          </div>

          <div className="lg:w-2/5 space-y-4">
            {formData.type === "VIDEO" && (
              <>
                <div>
                  <UpdateLessonVideo
                    file={videoFile}
                    setFile={(file) => {
                      setVideoFile(file);
                      setErrors((prev) => ({ ...prev, videoFile: null }));
                    }}
                    filePreview={videoFilePreview}
                    setFilePreview={setVideoFilePreview}
                    existingFileUrl={existingVideoUrl}
                  />
                  {errors.videoFile && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.videoFile}
                    </p>
                  )}
                </div>
                <div>
                  <UpdateLessonDocument
                    file={docFile}
                    setFile={(file) => {
                      setDocFile(file);
                      setErrors((prev) => ({ ...prev, attachedFile: null }));
                    }}
                    existingFileUrl={existingDocUrl}
                  />
                  {errors.attachedFile && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.attachedFile}
                    </p>
                  )}
                </div>
              </>
            )}
            {formData.type === "YOUTUBE" && (
              <>
                <div>
                  <YoutubeInput
                    youtubeUrl={youtubeUrl}
                    setYoutubeUrl={(url) => {
                      setYoutubeUrl(url);
                      setErrors((prev) => ({ ...prev, youtubeUrl: null }));
                    }}
                  />
                  {errors.youtubeUrl && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.youtubeUrl}
                    </p>
                  )}
                </div>
                <div>
                  <UpdateLessonDocument
                    file={docFile}
                    setFile={(file) => {
                      setDocFile(file);
                      setErrors((prev) => ({ ...prev, attachedFile: null }));
                    }}
                    existingFileUrl={existingDocUrl}
                  />
                  {errors.attachedFile && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.attachedFile}
                    </p>
                  )}
                </div>
              </>
            )}
            {formData.type === "DOCUMENT" && (
              <div>
                <UpdateLessonDocument
                  file={docFile}
                  setFile={(file) => {
                    setDocFile(file);
                    setErrors((prev) => ({ ...prev, attachedFile: null }));
                  }}
                  existingFileUrl={existingDocUrl}
                />
                {errors.attachedFile && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.attachedFile}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-gray-800">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary text-white"
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Lesson"}
          </Button>
        </div>
      </form>

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
