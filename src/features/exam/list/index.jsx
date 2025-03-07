"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Plus, MoreHorizontal, Pencil, Trash, ArrowDownAZ, ArrowDown, ArrowUp } from "lucide-react"
import { CreateExamDialog } from "../create"
import { EditExamDialog } from "../edit"
import { format } from "date-fns"
import { useAuth } from "@/provider/AuthProvider"
import { getListExamForExaminer } from "@/lib/api/exam_api"
import { cn } from "@/lib/utils"
import { FilterBar } from "./components/filter-list"
import { toast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
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
  sortBy: null,
  ascending: null
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentExam, setCurrentExam] = useState(null)
  const { apiCall } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0);
  const [noContent, setNoContent] = useState(false)
  const [sortBy, setSortBy] = useState('');
  const [ascending, setAscending] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: ""
  })

  const handleCreateExam = (exam) => {
    // In a real application, you would send this to your backend
    const newExam = {
      id: Math.max(...exams.map((e) => e.id)) + 1,
      code: `EXAM${String(exams.length + 1).padStart(3, "0")}`,
      title: exam.title,
      noParticipant: 0,
      startTime: exam.startTime,
      endTime: exam.endTime,
      status: ExamStatus.DRAFT,
      createdBy: { id: 1, name: "Current User", email: "user@example.com" },
      createdAt: Date.now()
    }
    fetchExamList();
    setIsCreateDialogOpen(false)
  }

  const handleFilterChange = (newFilters) => {
    console.log(newFilters);
    setFilters(newFilters)
    requestData.title = newFilters.title;
    if (newFilters.status === 'all') {
      requestData.status = null;
    }
    else {
      requestData.status = newFilters.status;
    }
    requestData.title = newFilters.search;
    requestData.start = newFilters.date.from.toISOString().slice(0, 16);
    requestData.end = newFilters.date.to.toISOString().slice(0, 16);
    requestData.page = 0;
    setCurrentPage(1)
    fetchExamList();
  }

  const fetchExamList = async () => {
    setIsLoading(true)
    try {
      const data = await getListExamForExaminer(apiCall, requestData)
      if (data == null) {
        setNoContent(true);
      }
      else {
        setExams(data.content);
        setTotalPages(data.totalPages);
        setNoContent(false);
      }
      console.log("API Response:", data)
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
    setCurrentPage(page);
    requestData.page = page - 1;
    fetchExamList();
  }
  const allStatuses = Array.from(new Set("Not Started", "Inprogress", "End"))

  const handleEditExam = (exam) => {
    if (currentExam) {
      const updatedExam = {
        ...currentExam,
        title: exam.title,
        startTime: exam.startTime,
        endTime: exam.endTime
      }
      setExams(exams.map((e) => (e.id === currentExam.id ? updatedExam : e)))
      setIsEditDialogOpen(false)
    }
  }
  toast({
    title: "Success",
    description: "Problem created successfully!",
    variant: "success"
  })
  toast("Error", {
    description: "Sunday, December 03, 2023 at 9:00 AM",
    variant: "destructive",
    action: {
      label: "Undo",
      onClick: () => console.log("Undo")
    }
  })
  const handleDeleteExam = async () => {
    try {
      console.log(currentExam.code);
      //await deleteExamForExaminer(apiCall, code)
      //fetchExamList();
      //if (response.ok) {
        toast({
          title: "Scheduled: Catch up ",
          description: "Friday, February 10, 2023 at 5:57 PM",
          action: (
            <ToastAction altText="Goto schedule to undo">Undo</ToastAction>
          ),
        })
      //}
    } catch (error) {
      console.error("Error delete exams:", error)
    } finally {
      setIsLoading(false)
    }
  }


const handleSort = (sort) => {
  if (sortBy == sort) {
    setAscending(!ascending);
    requestData.ascending = !ascending;
  }
  else {
    setSortBy(sort);
    setAscending(true);
    requestData.ascending = true;
  }
  requestData.sortBy = sort;
  requestData.page = 0;
  setCurrentPage(1)
  fetchExamList();

}

return (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Exams</h2>
      <FilterBar
        onFilterChange={handleFilterChange}
        status={allStatuses}
      />
      <Button onClick={() => setIsCreateDialogOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> Create Exam
      </Button>
    </div>
    {!noContent &&
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Title</TableHead>
            <TableHead onClick={() => { handleSort('noParticipant') }}>
              <p className="cursor-pointer">Participants
                {sortBy == 'noParticipant' && ascending &&
                  <ArrowUp className="ml-2 h-4 w-4 inline" />
                }
                {sortBy == 'noParticipant' && !ascending &&
                  <ArrowDown className=" ml-2 h-4 w-4 inline" />
                }
              </p>
            </TableHead>
            <TableHead onClick={() => { handleSort('startTime') }}>
              <p className="cursor-pointer">Start Time
                {sortBy == 'startTime' && ascending &&
                  <ArrowUp className="ml-2 h-4 w-4 inline" />
                }
                {sortBy == 'startTime' && !ascending &&
                  <ArrowDown className=" ml-2 h-4 w-4 inline" />
                }
              </p>
            </TableHead>
            <TableHead onClick={() => { handleSort('endTime') }}>
              <p className="cursor-pointer">End Time
                {sortBy == 'endTime' && ascending &&
                  <ArrowUp className="ml-2 h-4 w-4 inline" />
                }
                {sortBy == 'endTime' && !ascending &&
                  <ArrowDown className=" ml-2 h-4 w-4 inline" />
                }
              </p>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead onClick={() => { handleSort('createdAt') }}>
              <p className="cursor-pointer">Created At
                {sortBy == 'createdAt' && ascending &&
                  <ArrowUp className="ml-2 h-4 w-4 inline" />
                }
                {sortBy == 'createdAt' && !ascending &&
                  <ArrowDown className=" ml-2 h-4 w-4 inline" />
                }
              </p>
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.map((exam) => (
            <TableRow key={exam.id}>
              <TableCell>{exam.code}</TableCell>
              <TableCell>{exam.title}</TableCell>
              <TableCell>
                {exam.noParticipant}
              </TableCell>
              <TableCell>{format(new Date(exam.startTime).toLocaleString(), "dd/MM/yyyy HH:mm")}</TableCell>
              <TableCell>{format(new Date(exam.endTime).toLocaleString(), "dd/MM/yyyy HH:mm")}</TableCell>
              <TableCell>
                {exam.status === "NOT_STARTED" && "Not Started"}
                {exam.status === "IN_PROGRESS" && "In Progress"}
                {exam.status === "END" && "End"}
              </TableCell>

              <TableCell>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={exam.createdBy.avatar}
                    alt="avatar"
                    style={{ width: 30, height: 30, borderRadius: "50%", marginRight: 8 }}
                  />
                  <span>{exam.createdBy.username}</span>
                </div>
              </TableCell>

              <TableCell>{format(new Date(exam.createdAt).toLocaleString(), "dd/MM/yyyy HH:mm")}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setCurrentExam(exam)
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    {exam.status === "NOT_STARTED" && <DropdownMenuItem
                      className="text-red-500 hover:text-red-700 focus:text-red-700"
                      onClick={() => {
                        setCurrentExam(exam)
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      <Trash className="mr-2 h-4 w-4" onClick={() => {handleDeleteExam(exam)}} />Delete
                    </DropdownMenuItem>
                    }
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    }
    {noContent &&
      <div className="flex justify-center mt-6 gap-2">
        <p>No exams found.</p>
      </div>
    }

    {
      !isLoading && totalPages > 1 && !noContent && (
        <div className="flex justify-center mt-6 gap-2">
          <Button
            variant="ghost"
            className="text-primary font-bold hover:bg-primary transition hover:text-white"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex gap-1">
            {[...Array(totalPages)].map((_, index) => {
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
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={cn(
                      "text-primary font-bold hover:bg-primary transition hover:text-white",
                      currentPage === index + 1 && "bg-button-primary text-white bg-primary hover:bg-button-hover",
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
                  <Button key={index} variant="ghost" disabled className="text-primary font-bold">
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
      )
    }

    <CreateExamDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} onSubmit={handleCreateExam} />

    {
      currentExam && (
        <EditExamDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          exam={currentExam}
          onSubmit={handleEditExam}
        />
      )
    }

    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to <span className="text-red-500">DELETE</span> this exam?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently deactive the exam and remove all participants of this exam.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => {handleDeleteExam()}}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div >
)
}

