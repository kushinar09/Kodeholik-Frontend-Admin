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
import { Plus, MoreHorizontal, Pencil, ArrowDown, ArrowUp } from "lucide-react"
import { useAuth } from "@/provider/AuthProvider"
import { cn } from "@/lib/utils"
import { FilterBar } from "./components/filter-list"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { banUser, getListUserForAdmin, unbanUser } from "@/lib/api/user_api"
import { Skeleton } from "@/components/ui/skeleton"

const requestData = {
  page: 0,
  size: 5,
  text: "",
  status: null,
  role: null,
  start: null,
  end: null,
  ascending: false
}

const mockUsers = [
  {
    id: 1,
    username: "EXAM001",
    fullname: "JavaScript Basics",
    email: 50,
    status: "",
    role: "",
    createdDate: Date.now() - 86400000
  }
  // Add more mock exams as needed
]

export default function UserList({ onNavigate }) {
  const [users, setUsers] = useState(mockUsers)
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false)
  const [isUnbanDialogOpen, setIsUnbanDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const { apiCall } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [noContent, setNoContent] = useState(false)
  const [sortBy, setSortBy] = useState("createdAt")
  const [size, setSize] = useState(5)
  const [ascending, setAscending] = useState(false)
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    role: ""
  })


  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    requestData.title = newFilters.title
    if (newFilters.status === "all") {
      requestData.status = null
    }
    else {
      requestData.status = newFilters.status
    }
    if (newFilters.role === "all") {
      requestData.role = null
    }
    else {
      requestData.role = newFilters.role
    }
    requestData.text = newFilters.search
    requestData.start = newFilters.date.from.toISOString().slice(0, 16)
    requestData.end = newFilters.date.to.toISOString().slice(0, 16)
    requestData.page = 0
    setCurrentPage(1)
    fetchUserList()
  }

  const fetchUserList = async () => {
    setIsLoading(true)
    try {
      const data = await getListUserForAdmin(apiCall, requestData)
      if (data == null) {
        setNoContent(true)
        setTotalElements(0)
      }
      else {
        setUsers(data.content)
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
    fetchUserList()
  }, [])

  useEffect(() => {
    fetchUserList()
  }, [currentPage])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    requestData.page = page - 1
    fetchUserList()
  }

  const handleSort = () => {
    requestData.ascending = !ascending
    setAscending(!ascending)
    requestData.page = 0
    setCurrentPage(1)
    fetchUserList()
  }

  const handleSizeChange = (size) => {
    requestData.page = 0
    setCurrentPage(1)
    setSize(Number(size))
    requestData.size = Number(size)
    fetchUserList()
  }

  const handleBanUser = async () => {
    try {
      const response = await banUser(apiCall, currentUser.id)
      //fetchExamList();
      if (response == null) {
        toast.success("Ban user successful!", { duration: 2000 })
        requestData.page = 0
        setCurrentPage(1)
        fetchUserList()
      }
    } catch (error) {
      console.error("Error ban user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnbanUser = async () => {
    try {
      const response = await unbanUser(apiCall, currentUser.id)
      //fetchExamList();
      if (response == null) {
        toast.success("Unban user successful!", { duration: 2000 })
        requestData.page = 0
        setCurrentPage(1)
        fetchUserList()
      }
    } catch (error) {
      console.error("Error unban user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Users</h2>
        <Button onClick={() => onNavigate("/user/create")}>
          <Plus className="mr-2 h-4 w-4" /> Create User
        </Button>
      </div>
      <FilterBar
        onFilterChange={handleFilterChange}
      />
      <div className="flex items-center">
        <div>
          No Result: <span className="font-semibold">{users != null ? totalElements : 0}</span>
        </div>
        <div className="flex ml-8 items-center">
          <div>
            Size
          </div>
          <div className="ml-4">
            <Select value={size.toString()} onValueChange={(value) => handleSizeChange(value)}>
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
              <TableHead>Username</TableHead>
              <TableHead>Fullname</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead onClick={() => { handleSort() }}>
                <p className="cursor-pointer"> Created Date
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
                        <Skeleton className="h-5 w-4" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
              )
            }
            {!isLoading && users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <img loading="lazy"
                      src={user.avatar}
                      alt="avatar"
                      className="object-cover rounded-full mr-2 size-8"
                    />
                    <span>{user.username}</span>
                  </div>
                </TableCell>
                <TableCell className="truncate max-w-36" title={user.fullname}>{user.fullname}</TableCell>
                <TableCell className="truncate max-w-36" title={user.email}>
                  {user.email}{user.email}
                </TableCell>
                <TableCell>
                  {user.status === "ACTIVATED" && "Activated"}
                  {user.status === "NOT_ACTIVATED" && "Not Activated"}
                  {user.status === "BANNED" && "Banned"}
                </TableCell>
                <TableCell>
                  {user.role === "STUDENT" && "Student"}
                  {user.role === "TEACHER" && "Teacher"}
                  {user.role === "EXAMINER" && "Examiner"}
                  {user.role === "ADMIN" && "Admin"}
                </TableCell>
                <TableCell>{user.createdDate}</TableCell>

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
                        onClick={() => onNavigate("/user/edit/" + user.id)}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      {user.status !== "BANNED" &&
                        <DropdownMenuItem
                          className="text-red-500 cursor-pointer hover:text-red-700 focus:text-red-700"
                          onClick={() => {
                            setCurrentUser(user)
                            setIsBanDialogOpen(true)
                          }}
                        >
                          <svg className="h-8 w-8 text-red-500" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <rect x="5" y="11" width="14" height="10" rx="2" />  <circle cx="12" cy="16" r="1" />  <path d="M8 11v-4a4 4 0 0 1 8 0v4" /></svg>
                          Ban
                        </DropdownMenuItem>
                      }

                      {user.status === "BANNED" &&
                        <DropdownMenuItem
                          className="text-green-500 cursor-pointer hover:text-red-700 focus:text-red-700"
                          onClick={() => {
                            setCurrentUser(user)
                            setIsUnbanDialogOpen(true)
                          }}
                        >
                          <svg className="h-8 w-8 text-green-500" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <rect x="5" y="11" width="14" height="10" rx="2" />  <circle cx="12" cy="16" r="1" />  <path d="M8 11v-5a4 4 0 0 1 8 0" /></svg>
                          Unban
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
          <p>No users found.</p>
        </div>
      }

      <div className="flex justify-center items-center mt-4 w-full">
        {/* {isLoading &&
          <div className="flex items-center justify-center space-x-2 py-4">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md bg-primary" />
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-16 rounded-md" />
          </div>
        } */}
        {
          totalPages > 1 && !noContent &&
          (
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

          )
        }

      </div>


      <AlertDialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to <span className="text-red-500">BAN</span> this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This user will no longer be able to log into the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { handleBanUser() }}>Ban</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isUnbanDialogOpen} onOpenChange={setIsUnbanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to <span className="text-red-500">UNBAN</span> this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This user can log into the system again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { handleUnbanUser() }}>Unban</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  )
}

function LoadingSkeleton(size) {
  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">ID</TableHead>
              <TableHead className="w-[150px]">Username</TableHead>
              <TableHead className="w-[150px]">Fullname</TableHead>
              <TableHead className="w-[200px]">Email</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[120px]">Role</TableHead>
              <TableHead className="w-[150px]">Created Date</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(size)
              .fill(0).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-5 w-8" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 flex justify-center">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>
    </div>
  )
}