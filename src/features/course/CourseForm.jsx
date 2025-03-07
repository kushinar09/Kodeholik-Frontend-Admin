"use client"

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createCourse, updateCourse, getTopicList, getImage } from "@/lib/api/course_api";
import { useAuth } from "@/provider/AuthProvider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, ChevronUp, Upload, X } from "lucide-react";

function CourseForm({ course }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: course?.title || "",
    description: course?.description || "",
    topicIds: course?.topicIds || [],
    status: course?.status || "ACTIVATED",
  });
  const [topics, setTopics] = useState([]);
  const [imageFile, setImageFile] = useState(null); // Store the file
  const [imagePreview, setImagePreview] = useState(null); // Preview URL for new uploads
  const [imageUrl, setImageUrl] = useState(null); // Fetched URL for existing image
  const [isTopicsOpen, setIsTopicsOpen] = useState(false);
  const [topicSearch, setTopicSearch] = useState("");
  const [error, setError] = useState(null);
  const { apiCall } = useAuth();

  // Fetch topics
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await getTopicList();
        const formattedTopics = Array.isArray(data)
          ? data.map((topic) => ({ id: topic.id || topic, name: topic.name || topic }))
          : [];
        setTopics(formattedTopics);
        setError(null);
      } catch (error) {
        console.error("Error fetching topics:", error);
        setTopics([]);
        setError(error.message || "Failed to fetch topics");
      }
    };
    fetchTopics();
  }, []);

  // Fetch existing image URL if editing a course
  useEffect(() => {
    const fetchImage = async () => {
      if (course?.image) {
        try {
          // Assuming getImage is a function to fetch the image URL from your API
          const url = await getImage(course.image); // Replace with actual API call
          setImageUrl(url);
        } catch (error) {
          console.error("Error fetching image:", error);
          setError(error.message || "Failed to fetch course image");
        }
      }
    };
    fetchImage();
  }, [course]);

  // Clean up imagePreview URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(topicSearch.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTopicChange = (topicId) => {
    setFormData((prev) => ({
      ...prev,
      topicIds: prev.topicIds.includes(topicId)
        ? prev.topicIds.filter((id) => id !== topicId)
        : [...prev.topicIds, topicId],
    }));
  };

  const clearAllTopics = () => {
    setFormData((prev) => ({
      ...prev,
      topicIds: [],
    }));
    setTopicSearch("");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Revoke previous preview URL if it exists
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      // Create a new preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setImageFile(file);
      // Revoke previous preview URL if it exists
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const formPayload = new FormData();
    const courseData = JSON.stringify({
      title: formData.title,
      description: formData.description,
      status: formData.status,
      topicIds: formData.topicIds,
    });
    formPayload.append("data", new Blob([courseData], { type: "application/json" }));

    // Only append the image if a new file was uploaded
    if (imageFile) {
      formPayload.append("image", imageFile);
    }

    try {
      if (course?.id) {
        // Update existing course
        await updateCourse(course.id, formPayload);
      } else {
        // Create new course
        await createCourse(formPayload, null, apiCall);
      }
      navigate("/coursesList");
    } catch (error) {
      console.error("Error submitting course:", error);
      setError(error.message || "Failed to submit course");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-7xl mx-auto p-6 rounded-xl border border-gray-800 shadow-lg"
    >
      {error && (
        <div className="text-red-500 mb-4 p-3 bg-red-900/20 border border-red-800/50 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column - Form fields */}
        <div className="flex-1 space-y-5">
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Title"
            required
            className="w-full text-black border-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            required
            className="w-full h-40 text-black border-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"
          />

          {/* Collapsible topics section */}
          <Collapsible open={isTopicsOpen} onOpenChange={setIsTopicsOpen}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between w-full rounded-lg p-2 border border-gray-700 transition-colors hover:bg-gray-700/50 cursor-pointer">
                <span className="text-black text-sm font-medium">
                  {formData.topicIds.length > 0
                    ? `${formData.topicIds.length} topic(s) selected`
                    : "Select Topics"}
                </span>
                {isTopicsOpen ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 bg-gray-800/50 border border-gray-700 rounded-lg p-4 mt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-400">Topics</h4>
                <span
                  onClick={clearAllTopics}
                  className="cursor-pointer text-sm text-gray-400 hover:underline transition"
                >
                  Clear All
                </span>
              </div>
              <Input
                placeholder="Search topics..."
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
                className="w-full bg-gray-900/50 text-white border-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent placeholder-gray-500"
              />
              <div className="max-h-[6rem] overflow-y-auto overflow-x-hidden flex flex-wrap gap-3 pb-2">
                {filteredTopics.length > 0 ? (
                  filteredTopics.map((topic) => (
                    <div
                      key={topic.id}
                      className="flex-shrink-0 flex items-center space-x-2 rounded-lg p-2 transition-colors hover:bg-gray-700/50 border border-gray-700/50"
                    >
                      <Checkbox
                        id={`topic-${topic.id}`}
                        checked={formData.topicIds.includes(topic.id)}
                        onCheckedChange={() => handleTopicChange(topic.id)}
                        className="border-gray-600"
                      />
                      <Label
                        htmlFor={`topic-${topic.id}`}
                        className="text-white cursor-pointer text-sm whitespace-nowrap"
                      >
                        {topic.name}
                      </Label>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">No topics found</span>
                )}
              </div>
              <input type="hidden" name="topics" value={formData.topicIds.join(",")} />
            </CollapsibleContent>
          </Collapsible>

          {/* Status switch */}
          <div className="flex items-center space-x-3">
            <Switch
              id="status"
              checked={formData.status === "ACTIVATED"}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  status: checked ? "ACTIVATED" : "DEACTIVATED",
                }))
              }
              className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-600"
            />
            <Label htmlFor="status" className="text-white text-base font-medium">
              {formData.status === "ACTIVATED" ? "Activated" : "Deactivated"}
            </Label>
            <input type="hidden" name="status" value={formData.status} />
          </div>
        </div>

        {/* Right column - Image upload */}
        <div className="lg:w-2/5 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-400">Course Image</h4>
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Image upload area */}
          <div
            className="w-full aspect-video rounded-lg border border-gray-700 overflow-hidden bg-gray-900/30 flex flex-col items-center justify-center"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {imagePreview || imageUrl ? (
              <div className="relative w-full h-full">
                {/* Prioritize imagePreview if a new file is uploaded; otherwise use imageUrl */}
                <img
                  src={imagePreview || imageUrl || "/placeholder.svg"}
                  alt="Course preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 rounded-full bg-gray-800/80 hover:bg-gray-700 text-white"
                    onClick={() => document.getElementById("imageUpload").click()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8 rounded-full bg-red-600/80 hover:bg-red-700 text-white"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {imageFile && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gray-900/80 text-xs text-gray-300 p-2 truncate">
                    {imageFile.name} ({(imageFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </div>
                )}
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center h-full w-full p-6 cursor-pointer"
                onClick={() => document.getElementById("imageUpload").click()}
              >
                <div className="w-20 h-20 rounded-full bg-gray-800/70 flex items-center justify-center mb-4">
                  <Upload className="h-8 w-8 text-gray-500" />
                </div>
                <p className="text-gray-400 text-center">
                  Drag and drop an image here
                  <br />
                  or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-2">Recommended size: 1200 × 630 pixels</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4 bg-gray-800/50 text-white hover:bg-gray-700/50 border-gray-700"
                  onClick={() => document.getElementById("imageUpload").click()}
                >
                  Select Image
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Buttons container */}
      <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-gray-800">
        <Button
          type="button"
          variant="outline"
          className="bg-gray-800 text-white hover:bg-gray-700 border-gray-700 transition-colors"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
        >
          {course ? "Update" : "Create"} Course
        </Button>
      </div>
    </form>
  );
}

export default CourseForm;