import { GLOBALS } from "@/lib/constants";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { updateCourse, getTopicsWithId, getImage, getCourse } from "@/lib/api/course_api";
import { useAuth } from "@/provider/AuthProvider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, ChevronUp, Upload, X } from "lucide-react";

function UpdateCourse() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [formData, setFormData] = useState(null);
  const [topics, setTopics] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isTopicsOpen, setIsTopicsOpen] = useState(false);
  const [topicSearch, setTopicSearch] = useState("");
  const [error, setError] = useState(null);
  const { apiCall } = useAuth();

  useEffect(() => {
    document.title = `Update Course - ${GLOBALS.APPLICATION_NAME}`;
  }, []);

  // Fetch topics
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await getTopicsWithId();
        const formattedTopics = Array.isArray(data)
          ? data.map((topic) => ({
              id: String(topic.id || topic), // Ensure ID is a string
              name: topic.name || topic,
            }))
          : [];
        setTopics(formattedTopics);
        console.log("Fetched topics:", formattedTopics); // Debug log
      } catch (error) {
        console.error("Error fetching topics:", error);
        setError(error.message || "Failed to fetch topics");
      }
    };
    fetchTopics();
  }, []);

  // Fetch course data and map topics
  useEffect(() => {
    const fetchCourse = async () => {
      if (!topics.length) return; // Wait for topics
      try {
        const data = await getCourse(id);
        console.log("Fetched course data:", data); // Debug log
        setCourse(data);

        // Map topic names to IDs
        const topicIds = (data?.topics || []).map((topicName) => {
          const topic = topics.find((t) => t.name === topicName);
          return topic ? topic.id : null;
        }).filter((id) => id !== null);

        console.log("Mapped topicIds:", topicIds); // Debug log

        setFormData({
          title: data?.title || "",
          description: data?.description || "",
          topicIds: topicIds, // Ensure this is an array of strings
          status: data?.status || "ACTIVATED",
        });
      } catch (error) {
        console.error("Error fetching course:", error);
        setError(error.message || "Failed to fetch course data");
      }
    };
    fetchCourse();
  }, [id, topics]);

  // Fetch existing image URL
  useEffect(() => {
    const fetchImage = async () => {
      if (course?.image) {
        try {
          const url = await getImage(course.image);
          setImageUrl(url);
        } catch (error) {
          console.error("Error fetching image:", error);
          setError(error.message || "Failed to fetch course image");
        }
      }
    };
    if (course) fetchImage();
  }, [course]);

  // Clean up imagePreview URL
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  if (!course || !formData || !topics.length) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center text-text-primary">
        Loading...
      </div>
    );
  }

  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(topicSearch.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTopicChange = (topicId) => {
    setFormData((prev) => {
      const newTopicIds = prev.topicIds.includes(topicId)
        ? prev.topicIds.filter((id) => id !== topicId)
        : [...prev.topicIds, topicId];
      console.log("Updated topicIds:", newTopicIds); // Debug log
      return { ...prev, topicIds: newTopicIds };
    });
  };

  const clearAllTopics = () => {
    setFormData((prev) => ({ ...prev, topicIds: [] }));
    setTopicSearch("");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
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
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const courseData = {
      title: formData.title,
      description: formData.description,
      status: formData.status,
      topicIds: formData.topicIds,
    };

    try {
      if (typeof id !== "string" || !id) {
        throw new Error("Course ID is invalid or missing");
      }
      await updateCourse(id, courseData, imageFile, apiCall);
      navigate("/coursesList");
    } catch (error) {
      console.error("Error updating course:", error);
      setError(error.message || "Failed to update course");
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="container mx-auto p-6">
        <h1 className="text-2xl text-text-primary font-bold mb-4">Update Course</h1>
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
                <CollapsibleContent className="space-y-4 border border-gray-700 rounded-lg p-4 mt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-black">Topics</h4>
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
                    className="w-full text-black border-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent placeholder-gray-500"
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
                            className="text-black cursor-pointer text-sm whitespace-nowrap"
                          >
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
              </div>
            </div>

            <div className="lg:w-2/5 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-black">Course Image</h4>
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <div
                className="w-full aspect-video rounded-lg border border-gray-700 overflow-hidden flex flex-col items-center justify-center"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {imagePreview || imageUrl ? (
                  <div className="relative w-full h-full">
                    <img
                      src={imagePreview || imageUrl}
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
            </div>
          </div>

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
              Update Course
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateCourse;