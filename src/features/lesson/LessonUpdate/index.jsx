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

function UpdateLesson() {
  const { id } = useParams();
  const [searchParams] = useSearchParams(); // Thêm để lấy chapterId từ URL nếu có
  const navigate = useNavigate();
  const { apiCall } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    chapterId: searchParams.get("chapterId") || "", // Lấy chapterId từ URL nếu có
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
  const [error, setError] = useState(null);
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
          String(data.chapterId) || searchParams.get("chapterId") || "", // Ưu tiên dữ liệu từ API, sau đó từ URL
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
      setError(err.message || "Failed to load lesson details");
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
      setError(err.message || "Failed to fetch chapters");
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
      [name]: name === "displayOrder" ? Number.parseInt(value) : value,
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

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, description: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

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
      setError(err.message || "Failed to update lesson");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = () => {
    setShowSuccessDialog(false);
    navigate(`/lesson?chapterId=${formData.chapterId}`); // Gửi chapterId về LessonList
  };

  const handleCancel = () => {
    navigate(`/lesson?chapterId=${formData.chapterId}`); // Gửi chapterId về LessonList khi cancel
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
                <UpdateLessonVideo
                  file={videoFile}
                  setFile={setVideoFile}
                  filePreview={videoFilePreview}
                  setFilePreview={setVideoFilePreview}
                  existingFileUrl={existingVideoUrl}
                />
                <UpdateLessonDocument
                  file={docFile}
                  setFile={setDocFile}
                  existingFileUrl={existingDocUrl}
                />
              </>
            )}
            {formData.type === "YOUTUBE" && (
              <>
                <YoutubeInput
                  youtubeUrl={youtubeUrl}
                  setYoutubeUrl={setYoutubeUrl}
                />
                <UpdateLessonDocument
                  file={docFile}
                  setFile={setDocFile}
                  existingFileUrl={existingDocUrl}
                />
              </>
            )}
            {formData.type === "DOCUMENT" && (
              <UpdateLessonDocument
                file={docFile}
                setFile={setDocFile}
                existingFileUrl={existingDocUrl}
              />
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
              Your lesson {`"${formData.title}"`} has been updated successfully!
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
