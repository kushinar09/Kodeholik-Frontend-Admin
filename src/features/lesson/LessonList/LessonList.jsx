import { useState, useEffect } from "react";
import { getLessonByChapterId } from "@/lib/api/lesson_api";
import { getChapterList } from "@/lib/api/chapter_api";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GLOBALS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, Plus, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function LessonList() {
  const [lessons, setLessons] = useState([]);
  const [chapterId, setChapterId] = useState(1); // Default chapter ID
  const [chapters, setChapters] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // Search for lessons
  const [chapterSearchQuery, setChapterSearchQuery] = useState(""); // Search for chapters in filter
  const [isLoading, setIsLoading] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false); // State for filter expansion
  const [selectedChapter, setSelectedChapter] = useState(null); // Track selected chapter name

  useEffect(() => {
    document.title = `Lesson List - ${GLOBALS.APPLICATION_NAME}`;
  }, []);

  // Fetch lessons
  useEffect(() => {
    const fetchLessons = async () => {
      setIsLoading(true);
      try {
        const data = await getLessonByChapterId(chapterId);
        const lessonArray = Array.isArray(data) ? data : [];
        console.log("Fetched lessons:", lessonArray);
        setLessons(lessonArray);
      } catch (error) {
        console.error("Error fetching lessons:", error);
        setLessons([]);
      } finally {
        setIsLoading(false);
      }
    };
    if (chapterId) fetchLessons();
  }, [chapterId]);

  // Fetch chapters for filter
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const data = await getChapterList();
        const chapterArray = Array.isArray(data?.content) ? data.content : [];
        console.log("Fetched chapters:", chapterArray);
        setChapters(chapterArray);
        const initialChapter = chapterArray.find((chapter) => chapter.id === chapterId);
        setSelectedChapter(initialChapter?.title || `Unnamed Chapter (ID: ${chapterId})`);
      } catch (error) {
        console.error("Error fetching chapters:", error);
        setChapters([]);
      }
    };
    fetchChapters();
  }, []);

  // Client-side sorting
  const sortedLessons = [...lessons].sort((a, b) => {
    const order = sortOrder === "asc" ? 1 : -1;
    if (sortBy === "id") return order * (a.id - b.id);
    if (sortBy === "title") return order * (a.title.localeCompare(b.title));
    return 0;
  });

  // Client-side search for lessons
  const filteredLessons = sortedLessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Client-side pagination
  const totalItems = filteredLessons.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedLessons = filteredLessons.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Filter chapters based on search query in the filter
  const filteredChapters = chapters.filter((chapter) =>
    (chapter.title || `Unnamed Chapter (ID: ${chapter.id})`)
      .toLowerCase()
      .includes(chapterSearchQuery.toLowerCase())
  );

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(0);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(0);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      ACTIVATED: "bg-green-500",
      INACTIVATED: "bg-red-500",
    };
    return (
      <Badge className={`${statusMap[status] || "bg-gray-500"} text-white`}>
        {status?.toUpperCase()}
      </Badge>
    );
  };

  // Get chapter title by chapterId
  const getChapterTitle = (chapterId) => {
    const chapter = chapters.find((ch) => ch.id === chapterId);
    return chapter?.title || "Unknown Chapter";
  };

  // Handle filter toggle
  const handleFilterClick = () => {
    setIsFilterExpanded(!isFilterExpanded);
  };

  // Handle chapter selection
  const handleChapterClick = (chapter) => {
    setChapterId(chapter.id);
    setSelectedChapter(chapter.title || `Unnamed Chapter (ID: ${chapter.id})`);
    setIsFilterExpanded(false);
    setChapterSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="border-border-muted bg-bg-card shadow-lg">
          <CardHeader className="pb-4 border-b border-border-muted">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="text-3xl font-bold text-text-primary">Lesson List</CardTitle>
              <Link to="/lesson/add">
                <Button className="bg-primary text-white font-bold hover:bg-primary/90 transition-colors text-base py-2 px-4 w-full md:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Lesson
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow">
                  <Input
                    type="text"
                    placeholder="Search lesson title..."
                    className="pl-10 p-2 w-full bg-input-bg text-input-text placeholder-input-placeholder border-input-border focus:border-input-borderFocus focus:ring-input-focusRing rounded-md"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div>
                  <Button
                    variant="ghost"
                    onClick={handleFilterClick}
                    className={cn(
                      "text-primary font-bold hover:bg-primary transition hover:text-white",
                      isFilterExpanded && "bg-button-primary text-bg-primary hover:bg-button-hover"
                    )}
                  >
                    Filter by Chapter
                    <span className="ml-2 text-sm">{isFilterExpanded ? "▲" : "▼"}</span>
                  </Button>
                </div>
              </div>

              {isFilterExpanded && (
                <div className="p-4 bg-bg-card border border-border-muted rounded-lg shadow-sm animate-in fade-in duration-200">
                  <h3 className="text-sm font-medium text-text-secondary mb-3">Filter by Chapter</h3>
                  <div className="relative mb-3">
                    <Input
                      type="text"
                      placeholder="Search chapter name..."
                      className="pl-10 p-2 w-full bg-input-bg text-input-text placeholder-input-placeholder border-input-border focus:border-input-borderFocus focus:ring-input-focusRing rounded-md"
                      value={chapterSearchQuery}
                      onChange={(e) => setChapterSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap max-h-40 overflow-y-auto">
                    {filteredChapters.length > 0 ? (
                      filteredChapters.map((chapter) => (
                        <Button
                          key={chapter.id}
                          variant={
                            selectedChapter === (chapter.title || `Unnamed Chapter (ID: ${chapter.id})`)
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => handleChapterClick(chapter)}
                          className={cn(
                            "text-sm",
                            selectedChapter === (chapter.title || `Unnamed Chapter (ID: ${chapter.id})`)
                              ? "bg-primary text-white hover:bg-primary/90"
                              : "text-primary border-primary hover:bg-primary/10"
                          )}
                        >
                          {chapter.title || `Unnamed Chapter (ID: ${chapter.id})`}
                        </Button>
                      ))
                    ) : (
                      <p className="text-sm text-text-secondary">No chapters found</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredLessons.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                <p className="text-lg font-medium">No lessons found</p>
                <p className="text-sm mt-2">Try adjusting your search or chapter selection</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border-muted">
                <Table className="w-full">
                  <TableHeader className="bg-bg-secondary">
                    <TableRow className="hover:bg-bg-secondary/80">
                      <TableHead
                        className="text-text-secondary font-semibold cursor-pointer"
                        onClick={() => handleSort("id")}
                      >
                        ID {sortBy === "id" && (sortOrder === "asc" ? "▲" : "▼")}
                      </TableHead>
                      <TableHead
                        className="text-text-secondary font-semibold cursor-pointer"
                        onClick={() => handleSort("title")}
                      >
                        Title {sortBy === "title" && (sortOrder === "asc" ? "▲" : "▼")}
                      </TableHead>
                      <TableHead>Chapter Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-text-secondary font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLessons.map((lesson) => (
                      <TableRow
                        key={lesson.id}
                        className="hover:bg-bg-secondary/30 transition-colors border-t border-border-muted"
                      >
                        <TableCell className="font-medium text-text-primary">{lesson.id}</TableCell>
                        <TableCell className="text-text-primary">{lesson.title}</TableCell>
                        <TableCell className="text-text-primary">{getChapterTitle(lesson.chapterId)}</TableCell>
                        <TableCell className="text-text-primary">{lesson.type}</TableCell>
                        <TableCell>{getStatusBadge(lesson.status)}</TableCell>
                        <TableCell>
                          <Link to={`/lesson/${lesson.id}`}>
                            <Button
                              variant="outline"
                              className="border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                              size="sm"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {!isLoading && filteredLessons.length > 0 && (
              <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Items per page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 per page</SelectItem>
                    <SelectItem value="12">12 per page</SelectItem>
                    <SelectItem value="24">24 per page</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="text-primary font-bold hover:bg-primary transition hover:text-black"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </Button>
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, index) => (
                      <Button
                        variant="ghost"
                        key={index}
                        onClick={() => handlePageChange(index)}
                        className={cn(
                          "text-primary font-bold hover:bg-primary transition hover:text-black",
                          currentPage === index && "bg-button-primary text-bg-primary hover:bg-button-hover"
                        )}
                      >
                        {index + 1}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    className="text-primary font-bold hover:bg-primary transition hover:text-black"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default LessonList;