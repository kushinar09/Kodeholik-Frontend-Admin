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
import { Plus, MoreHorizontal, Pencil, Trash } from "lucide-react"
import { CreateExamDialog } from "../create"
import { EditExamDialog } from "../edit"
import { format } from "date-fns"
import { useAuth } from "@/provider/AuthProvider"
import { getListExamForExaminer } from "@/lib/api/exam_api"

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
    createdBy: { id: 1, name: "John Doe", email: "john@example.com" },
    createdAt: Date.now() - 86400000 // Yesterday
  }
  // Add more mock exams as needed
]

export function ExamList({ onNavigate }) {
  const [exams, setExams] = useState(mockExams)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentExam, setCurrentExam] = useState(null)
  const { apiCall } = useAuth()
  const [isLoading, setIsLoading] = useState(true)



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
    setExams([...exams, newExam])
    setIsCreateDialogOpen(false)
  }
  const fetchExamList = async () => {
    setIsLoading(true)
    try {
      const data = await getListExamForExaminer(apiCall, requestData)
      console.log("API Response:", data)
    } catch (error) {
      console.error("Error fetching exams:", error)
    } finally {
     setIsLoading(false)
    }
  }
  useEffect(() => {
    console.log("Fetching exam list...");
    fetchExamList()
  }, [])

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

  const handleDeleteExam = () => {
    if (currentExam) {
      setExams(exams.filter((e) => e.id !== currentExam.id))
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Exams</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Exam
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Participants</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.map((exam) => (
            <TableRow key={exam.id}>
              <TableCell>{exam.code}</TableCell>
              <TableCell>{exam.title}</TableCell>
              <TableCell>{exam.noParticipant}</TableCell>
              <TableCell>{format(new Date(exam.startTime).toLocaleString(), "dd/MM/yyyy HH:mm")}</TableCell>
              <TableCell>{format(new Date(exam.endTime).toLocaleString(), "dd/MM/yyyy HH:mm")}</TableCell>
              <TableCell>{exam.status}</TableCell>
              <TableCell>{exam.createdBy.name}</TableCell>
              <TableCell>{new Date(exam.createdAt).toLocaleString()}</TableCell>
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
                    <DropdownMenuItem
                      className="text-red-500 hover:text-red-700 focus:text-red-700"
                      onClick={() => {
                        setCurrentExam(exam)
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Cancel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CreateExamDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} onSubmit={handleCreateExam} />

      {currentExam && (
        <EditExamDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          exam={currentExam}
          onSubmit={handleEditExam}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to <span className="text-red-500">CANCEL</span> this exam?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently deactive the exam and remove all participants of this exam.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteExam}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

