"use client";

import { GLOBALS } from "@/lib/constants";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createChapter } from "@/lib/api/chapter_api";
import { getCourseSearch } from "@/lib/api/course_api";
import { useAuth } from "@/provider/AuthProvider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  BookOpen,
  ArrowLeft,
  Save,
  CheckCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MarkdownEditor from "@/components/layout/markdown/MarkdownEditor";

// Define the Zod schema for form validation
const formSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be less than 5000 characters"),
  displayOrder: z
    .number()
    .min(0, "Display order must be a non-negative number"),
  status: z.enum(["ACTIVATED", "INACTIVATED"]),
  courseId: z.number().min(1, "A course must be selected"),
});

function CreateChapter() {
  const navigate = useNavigate();
  const { apiCall } = useAuth();

  useEffect(() => {
    document.title = `Create Chapter - ${GLOBALS.APPLICATION_NAME}`;
  }, []);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    displayOrder: 0,
    status: "ACTIVATED",
    courseId: null,
  });
  const [courses, setCourses] = useState([]);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [courseSearch, setCourseSearch] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false); // State for dialog

  // Fetch courses for selection
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourseSearch({
          page: 0,
          size: 100,
          sortBy: "title",
          ascending: true,
        });
        const formattedCourses = (data.content || []).map((course) => ({
          id: course.id,
          title: course.title || `Unnamed Course (ID: ${course.id})`,
        }));
        setCourses(formattedCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses([]);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "displayOrder" ? Number(value) : value,
    }));
  };

  const handleCourseChange = (courseId) => {
    setFormData((prev) => ({
      ...prev,
      courseId: prev.courseId === courseId ? null : courseId,
    }));
  };

  const clearCourseSelection = () => {
    setFormData((prev) => ({ ...prev, courseId: null }));
    setCourseSearch("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const dataToValidate = {
      title: formData.title,
      description: formData.description,
      displayOrder: formData.displayOrder,
      status: formData.status,
      courseId: formData.courseId,
    };

    try {
      formSchema.parse(dataToValidate);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        setError(validationError.errors[0].message);
        setIsSubmitting(false);
        return;
      }
      setError("An unexpected validation error occurred");
      setIsSubmitting(false);
      return;
    }

    const chapterData = {
      courseId: formData.courseId,
      title: formData.title,
      description: formData.description,
      displayOrder: formData.displayOrder,
      status: formData.status,
    };

    try {
      await createChapter(chapterData, apiCall);
      setIsSuccessDialogOpen(true); // Open the success dialog
      setTimeout(() => {
        setIsSuccessDialogOpen(false); // Close dialog
        navigate("/chapter"); // Navigate to /chapter
      }, 2000); // 2-second delay
    } catch (error) {
      console.error("Error creating chapter:", error);
      setError(error.message || "Failed to create chapter");
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    return status === "ACTIVATED" ? (
      <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
        ACTIVATED
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="bg-red-500/10 text-red-500 border-red-500/20"
      >
        INACTIVATED
      </Badge>
    );
  };

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, description: value }));
  };

  return (
    <div className="container py-8 px-4 pt-0 sm:px-6">
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-8 w-8 rounded-full"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Go back</span>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          Create New Chapter
        </h1>
      </div>

      <Card className="border-border/40 shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>Chapter Details</CardTitle>
          </div>
          <CardDescription>
            Add a new chapter to a course. Fill in all the required information
            below.
          </CardDescription>
        </CardHeader>

        {error && (
          <div className="px-6">
            <Alert
              variant="destructive"
              className="border-red-500/20 bg-red-500/10 text-red-500"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

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
                className="border-input/40"
                required
                disabled={isSubmitting || isSuccessDialogOpen} // Disable during submission or success
              />
            </div>

            <Collapsible open={isCoursesOpen} onOpenChange={setIsCoursesOpen}>
              <h4 className="text-sm font-semibold pb-2">
                Course <span className="text-red-500">*</span>
              </h4>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between w-full rounded-lg p-2 border border-gray-700 hover:bg-gray-700/50 cursor-pointer">
                  <span className="text-black text-sm font-medium">
                    {formData.courseId
                      ? courses.find((c) => c.id === formData.courseId)
                          ?.title || "Course Selected"
                      : "Select a Course (required)"}
                  </span>
                  {isCoursesOpen ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 border border-gray-700 rounded-lg p-4 mt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-black">
                    Choose a course
                  </h4>
                  <span
                    onClick={clearCourseSelection}
                    className="cursor-pointer text-sm text-gray-400 hover:underline"
                  >
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
                        className="flex-shrink-0 flex items-center space-x-2 rounded-lg p-2 hover:bg-gray-700/50 border border-gray-700/50"
                      >
                        <Checkbox
                          id={`course-${course.id}`}
                          checked={formData.courseId === course.id}
                          onCheckedChange={() => handleCourseChange(course.id)}
                          disabled={isSubmitting || isSuccessDialogOpen}
                        />
                        <Label
                          htmlFor={`course-${course.id}`}
                          className="text-black text-sm whitespace-nowrap"
                        >
                          {course.title}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">
                      No courses found
                    </span>
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
                  className="border-input/40"
                  required
                  disabled={isSubmitting || isSuccessDialogOpen}
                />
                <p className="text-xs text-muted-foreground">
                  Determines the order in which chapters appear
                </p>
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
                          status: checked ? "ACTIVATED" : "INACTIVATED",
                        }))
                      }
                      disabled={isSubmitting || isSuccessDialogOpen}
                    />
                    <Label
                      htmlFor="status"
                      className="font-medium cursor-pointer"
                    >
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
              <div className="h-[400px]">
                <MarkdownEditor
                  value={formData.description}
                  onChange={handleDescriptionChange}
                />
              </div>
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
            <Button
              type="submit"
              className="gap-1"
              disabled={isSubmitting || isSuccessDialogOpen}
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? "Creating..." : "Create Chapter"}
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
              Chapter created successfully! You will be redirected to the
              chapter list shortly.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateChapter;
