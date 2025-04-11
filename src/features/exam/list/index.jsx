"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Plus, MoreHorizontal, Pencil, Trash, ArrowDown, ArrowUp, StopCircleIcon, Download } from "lucide-react"
import { useAuth } from "@/provider/AuthProvider"
import { deleteExamForExaminer, getListExamForExaminer } from "@/lib/api/exam_api"
import { cn } from "@/lib/utils"
import { FilterBar } from "./components/filter-list"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ExamOverviewDialog from "./components/exam-overview-dialog"
import { ENDPOINTS } from "@/lib/constants"

const ExamStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ONGOING: "ONGOING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED"
}

const requestData = {
  page: 0,
  size: 5,
  title: "",
  status: null,
  start: null,
  end: null,
  sortBy: "createdAt",
  ascending: false
}

const mockExams = [
  {
    id: 1,
    code: "EXAM001",
    title: "JavaScript Basics",
    noParticipant: 50,
    startTime: Date.now() + 86400000, // Tomorrow
    endTime: Date.now() + 172800000, // Day after tomorrow
    status: ExamStatus.PUBLISHED,
    createdBy: { id: 1, username: "John Doe", avatar: "john@example.com" },
    createdAt: Date.now() - 86400000 // Yesterday
  }
  // Add more mock exams as needed
]

export default function ExamList({ onNavigate }) {
  const [exams, setExams] = useState(mockExams)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentExam, setCurrentExam] = useState(null)
  const { apiCall } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [noContent, setNoContent] = useState(false)
  const [sortBy, setSortBy] = useState("createdAt")
  const [size, setSize] = useState("5")
  const [ascending, setAscending] = useState(false)
  const [filters, setFilters] = useState({
    search: "",
    status: ""
  })
  const [isOverviewDialogOpen, setIsOverviewDialogOpen] = useState(false)
  const [selectedExamCode, setSelectedExamCode] = useState(null)

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    requestData.title = newFilters.title
    if (newFilters.status === "all") {
      requestData.status = null
    } else {
      requestData.status = newFilters.status
    }
    requestData.title = newFilters.search
    requestData.start = newFilters.date.from.toISOString().slice(0, 16)
    requestData.end = newFilters.date.to.toISOString().slice(0, 16)
    requestData.page = 0
    setCurrentPage(1)
    fetchExamList()
  }

  const fetchExamList = async () => {
    setIsLoading(true)
    try {
      const data = await getListExamForExaminer(apiCall, requestData)
      if (data == null) {
        setNoContent(true)
        setTotalElements(0)
      } else {
        setExams(data.content)
        setTotalPages(data.totalPages)
        setNoContent(false)
        setTotalElements(data.totalElements)
      }
    } catch (error) {
      console.error("Error fetching exams:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchExamList()
  }, [])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    requestData.page = page - 1
    fetchExamList()
  }

  const handleSizeChange = (size) => {
    requestData.page = 0
    setCurrentPage(1)
    setSize(size)
    requestData.size = Number(size)
    fetchExamList()
  }
  const allStatuses = Array.from(new Set("Not Started", "Inprogress", "End"))

  const handleDeleteExam = async () => {
    try {
      const response = await deleteExamForExaminer(apiCall, currentExam.code)
      //fetchExamList();
      if (response.ok) {
        toast.success("Delete exam successful!", { duration: 2000 })
        requestData.page = 0
        setCurrentPage(1)
        fetchExamList()
      }
    } catch (error) {
      console.error("Error delete exams:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (sort) => {
    if (sortBy == sort) {
      setAscending(!ascending)
      requestData.ascending = !ascending
    } else {
      setSortBy(sort)
      setAscending(true)
      requestData.ascending = true
    }
    requestData.sortBy = sort
    requestData.page = 0
    setCurrentPage(1)
    fetchExamList()
  }

  const handleRowClick = (exam) => {
    setSelectedExamCode(exam.code)
    setIsOverviewDialogOpen(true)
  }

  const handleDownloadResult = async (examCode) => {
    try {
      const response = await apiCall(ENDPOINTS.GET_DOWNLOAD_EXAM_RESULT.replace(":code", examCode))

      if (!response.ok) {
        throw new Error("Failed to download file")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `exam_result_${examCode}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast.error("Download error", {
        description: error
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Exams</h2>
        <FilterBar onFilterChange={handleFilterChange} status={allStatuses} />
        <Button onClick={() => onNavigate("/exam/create")}>
          <Plus className="h-4 w-4" /> Create Exam
        </Button>
      </div>
      <div className="flex items-center">
        <div>
          No Result: <span className="font-semibold">{totalElements}</span>
        </div>
        <div className="flex ml-8 items-center">
          <div>Size</div>
          <div className="ml-4">
            <Select value={size} onValueChange={(value) => handleSizeChange(value)}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent defaultValue="all">
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      {!noContent && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Title</TableHead>
              <TableHead
                onClick={() => {
                  handleSort("noParticipant")
                }}
              >
                <p className="cursor-pointer">
                  Participants
                  {sortBy == "noParticipant" && ascending && <ArrowUp className="ml-2 h-4 w-4 inline" />}
                  {sortBy == "noParticipant" && !ascending && <ArrowDown className=" ml-2 h-4 w-4 inline" />}
                </p>
              </TableHead>
              <TableHead
                onClick={() => {
                  handleSort("startTime")
                }}
              >
                <p className="cursor-pointer">
                  Start Time
                  {sortBy == "startTime" && ascending && <ArrowUp className="ml-2 h-4 w-4 inline" />}
                  {sortBy == "startTime" && !ascending && <ArrowDown className=" ml-2 h-4 w-4 inline" />}
                </p>
              </TableHead>
              <TableHead
                onClick={() => {
                  handleSort("endTime")
                }}
              >
                <p className="cursor-pointer">
                  End Time
                  {sortBy == "endTime" && ascending && <ArrowUp className="ml-2 h-4 w-4 inline" />}
                  {sortBy == "endTime" && !ascending && <ArrowDown className=" ml-2 h-4 w-4 inline" />}
                </p>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead
                onClick={() => {
                  handleSort("createdAt")
                }}
              >
                <p className="cursor-pointer">
                  Created At
                  {sortBy == "createdAt" && ascending && <ArrowUp className="ml-2 h-4 w-4 inline" />}
                  {sortBy == "createdAt" && !ascending && <ArrowDown className=" ml-2 h-4 w-4 inline" />}
                </p>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.map((exam) => (
              <TableRow
                key={exam.id}
                className={`hover:bg-muted/50 ${exam.status === "END" ? "cursor-pointer" : "cursor-default"}`}
                onClick={exam.status === "END" ? () => handleRowClick(exam) : undefined}
              >
                <TableCell>{exam.code}</TableCell>
                <TableCell>{exam.title}</TableCell>
                <TableCell>{exam.noParticipant}</TableCell>
                <TableCell>{exam.startTime}</TableCell>
                <TableCell>{exam.endTime}</TableCell>
                <TableCell>
                  {exam.status === "NOT_STARTED" && "Not Started"}
                  {exam.status === "IN_PROGRESS" && "In Progress"}
                  {exam.status === "END" && "End"}
                </TableCell>

                <TableCell>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <img loading="lazy"
                      src={exam.createdBy.avatar || "/placeholder.svg"}
                      alt="avatar"
                      style={{ width: 30, height: 30, borderRadius: "50%", marginRight: 8 }}
                    />
                    <span>{exam.createdBy.username}</span>
                  </div>
                </TableCell>

                <TableCell>{exam.createdAt}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {exam.status === "NOT_STARTED" && (
                        <>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => onNavigate("/exam/edit/" + exam.code)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-red-500 hover:text-red-700 focus:text-red-700"
                            onClick={() => {
                              setCurrentExam(exam)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash
                              className="mr-2 h-4 w-4"
                              onClick={() => {
                                handleDeleteExam(exam)
                              }}
                            />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                      {exam.status === "IN_PROGRESS" && exam.noParticipant > 0 && (
                        <DropdownMenuItem className="cursor-pointer text-red-500 hover:text-red-700 focus:text-red-700">
                          <StopCircleIcon />
                          Force End
                        </DropdownMenuItem>
                      )}
                      {exam.status === "END" && exam.noParticipant > 0 && (
                        <>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => onNavigate("/exam/result/" + exam.code)}
                          >
                            <svg
                              className="h-4 w-4 text-black"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              strokeWidth="2"
                              stroke="currentColor"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              {" "}
                              <path stroke="none" d="M0 0h24v24H0z" /> <rect x="5" y="3" width="14" height="18" rx="2" />{" "}
                              <line x1="9" y1="7" x2="15" y2="7" /> <line x1="9" y1="11" x2="15" y2="11" />{" "}
                              <line x1="9" y1="15" x2="13" y2="15" />
                            </svg>
                            View Result
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleDownloadResult(exam.code)}
                          >
                            <Download className="size-4" />
                            Download
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {noContent && (
        <div className="flex justify-center mt-6 gap-2">
          <p>No exams found.</p>
        </div>
      )}

      {totalPages > 1 && !noContent && (
        <div className="flex justify-between items-center mt-4 w-full">
          <div className="flex-1 flex justify-center gap-2">
            <Button
              variant="ghost"
              className="text-primary font-bold hover:bg-primary transition hover:text-white"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, index) => {
                // Show limited page numbers with ellipsis for better UX
                if (
                  totalPages <= 5 ||
                  index === 0 ||
                  index === totalPages - 1 ||
                  (index >= currentPage - 1 && index <= currentPage + 1)
                ) {
                  return (
                    <Button
                      variant="ghost"
                      key={`page-${index}`}
                      onClick={() => handlePageChange(index + 1)}
                      className={cn(
                        "text-primary font-bold hover:bg-primary transition hover:text-white",
                        currentPage === index + 1 && "bg-button-primary text-white bg-primary hover:bg-button-hover"
                      )}
                    >
                      {index + 1}
                    </Button>
                  )
                } else if (
                  (index === 1 && currentPage > 3) ||
                  (index === totalPages - 2 && currentPage < totalPages - 2)
                ) {
                  return (
                    <Button key={`ellipsis-${index}`} variant="ghost" disabled className="text-primary font-bold">
                      ...
                    </Button>
                  )
                }
                return null
              })}
            </div>
            <Button
              variant="ghost"
              className="text-primary font-bold hover:bg-primary transition hover:text-white"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to <span className="text-red-500">DELETE</span> this exam?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently deactive the exam and remove all participants of this
              exam.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleDeleteExam()
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ExamOverviewDialog
        examCode={selectedExamCode}
        isOpen={isOverviewDialogOpen}
        onClose={() => setIsOverviewDialogOpen(false)}
        apiCall={apiCall}
      />
    </div>
  )
}

