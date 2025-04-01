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
import { Plus, MoreHorizontal, Pencil, Trash, ArrowDown, ArrowUp } from "lucide-react"
import { useAuth } from "@/provider/AuthProvider"
import { deleteExamForExaminer, getListExamForExaminer } from "@/lib/api/exam_api"
import { cn } from "@/lib/utils"
import { FilterBar } from "./components/filter-list"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addTag, deleteTag, editTag, getListTagForAdmin } from "@/lib/api/tag_api"
import { CreateTagDialog } from "../create"
import { EditTagDialog } from "../edit"
import { Skeleton } from "@/components/ui/skeleton"

const requestData = {
  page: 0,
  size: 5,
  name: "",
  type: "LANGUAGE",
  ascending: false
}

const mockTags = [
  {
    id: 1,
    name: "",
    type: "",
    createdAt: "",
    createdBy: { id: 1, username: "John Doe", avatar: "john@example.com" }
  }
  // Add more mock exams as needed
]

export default function TagList({ onNavigate }) {
  const [tags, setTags] = useState(mockTags)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentTag, setCurrentTag] = useState(null)
  const { apiCall } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [noContent, setNoContent] = useState(false)
  const [sortBy, setSortBy] = useState("createdAt")
  const [size, setSize] = useState("5")
  const [ascending, setAscending] = useState(false)
  const [currentType, setCurrentType] = useState("LANGUAGE")
  const [filters, setFilters] = useState({
    search: "",
    type: ""
  })

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    if (newFilters.type === "all") {
      requestData.type = null
    }
    else {
      requestData.type = newFilters.type
    }
    requestData.name = newFilters.search
    requestData.page = 0
    setCurrentPage(1)
    fetchTagList()
  }

  const handleCreateTag = (tag) => {
    createTag(tag)
  }

  const handleEditTag = (tag) => {
    updateTag(tag)
  }

  const updateTag = async (tag) => {
    setIsLoading(true)
    try {
      await editTag(apiCall, tag, tag.id)
      toast.success("Tag update successfully")
      setIsEditDialogOpen(false)
      if (tag.type === "SKILL") {
        requestData.type = "SKILL"
      }
      else if (tag.type === "LANGUAGE") {
        requestData.type = "LANGUAGE"
      }
      else if (tag.type === "TOPIC") {
        requestData.type = "TOPIC"
      }
      setCurrentType(tag.type)
      fetchTagList()
    } catch (error) {
      console.error("Error creating tag:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createTag = async (tag) => {
    setIsLoading(true)
    try {
      await addTag(apiCall, tag)
      toast.success("Tag created successfully")
      setIsCreateDialogOpen(false)
      if (tag.type === "SKILL") {
        requestData.type = "SKILL"
      }
      else if (tag.type === "LANGUAGE") {
        requestData.type = "LANGUAGE"
      }
      else if (tag.type === "TOPIC") {
        requestData.type = "TOPIC"
      }
      setCurrentType(tag.type)
      fetchTagList()
    } catch (error) {
      console.error("Error creating tag:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTagList = async () => {
    setIsLoading(true)
    try {
      const data = await getListTagForAdmin(apiCall, requestData)
      if (data == null) {
        setNoContent(true)
        setTotalElements(0)
      }
      else {
        setTags(data.content)
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
    fetchTagList()
  }, [])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    requestData.page = page - 1
    fetchTagList()
  }

  const handleSizeChange = (size) => {
    requestData.page = 0
    setCurrentPage(1)
    setSize(size)
    requestData.size = Number(size)
    fetchTagList()
  }

  const handleSort = () => {
    requestData.ascending = !ascending
    setAscending(!ascending)
    requestData.page = 0
    setCurrentPage(1)
    fetchTagList()
  }

  const handleDeleteTag = async () => {
    try {
      const response = await deleteTag(apiCall, currentTag.id, currentTag.type)
      if (response == null) {
        toast.success("Delete successful!", { duration: 2000 })
        requestData.page = 0
        setCurrentPage(1)
        fetchTagList()
      }
    } catch (error) {
      console.error("Error delete tag:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tags</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Tag
        </Button>
      </div>
      <FilterBar
        onFilterChange={handleFilterChange}
        currentType={currentType}
      />
      <div className="flex items-center">
        <div>
          No Result: <span className="font-semibold">{totalElements}</span>
        </div>
        <div className="flex ml-8 items-center">
          <div>
            Size
          </div>
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
      {!noContent &&
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead onClick={() => { handleSort() }}>
                <p className="cursor-pointer"> Created At
                  {ascending &&
                    <ArrowUp className="ml-2 h-4 w-4 inline" />
                  }
                  {!ascending &&
                    <ArrowDown className=" ml-2 h-4 w-4 inline" />
                  }
                </p>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              (
                Array(size)
                  .fill(0).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-5 w-6" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-32 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                    </TableRow>
                  ))
              )
            }
            {!isLoading && tags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell>{tag.id}</TableCell>
                <TableCell>{tag.name}</TableCell>
                <TableCell>{tag.type}</TableCell>
                <TableCell>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <img
                      src={tag.createdBy.avatar}
                      alt="avatar"
                      style={{ width: 30, height: 30, borderRadius: "50%", marginRight: 8 }}
                    />
                    <span>{tag.createdBy.username}</span>
                  </div>
                </TableCell>
                <TableCell>{tag.createdAt}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="cursor-pointer"
                        onClick={() => {
                          setCurrentTag(tag)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500 hover:text-red-700 focus:text-red-700"
                        onClick={() => {
                          setCurrentTag(tag)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash className="mr-2 h-4 w-4" onClick={() => { handleDeleteTag }} />Delete
                      </DropdownMenuItem>

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
          <p>No tags found.</p>
        </div>
      }

      {
        !isLoading && totalPages > 1 && !noContent && (
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
          </div>
        )
      }

      <CreateTagDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} onSubmit={handleCreateTag} />

      {currentTag != null && <EditTagDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} onSubmit={handleEditTag} tag={currentTag} setTag={setCurrentTag} />}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to <span className="text-red-500">DELETE</span> this tag?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { handleDeleteTag() }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  )
}

