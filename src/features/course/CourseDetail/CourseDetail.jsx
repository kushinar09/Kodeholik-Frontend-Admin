"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  getCourse,
  usersEnrolledCourse,
  getCourseDiscussion,
  discussionCourse,
  getDiscussionReply,
  upvoteDiscussion,
  unUpvoteDiscussion
} from "@/lib/api/course_api"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GLOBALS } from "@/lib/constants"
import { Input } from "@/components/ui/input"
import { Search, Send, X, ArrowBigUp, ChevronDown, ChevronUp, MessageSquare, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDistanceToNow } from "date-fns"

function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Enrolled Users State
  const [course, setCourse] = useState(null)
  const [enrolledUsers, setEnrolledUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("enrolledAt")
  const [sortDir, setSortDir] = useState("desc")
  const [currentPage, setCurrentPage] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)

  // Discussion State
  const [discussionLoading, setDiscussionLoading] = useState(true)
  const [discussionError, setDiscussionError] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [replyingTo, setReplyingTo] = useState(null)
  const [posting, setPosting] = useState(false)
  const [discussionPage, setDiscussionPage] = useState(0)
  const [discussionTotalPages, setDiscussionTotalPages] = useState(1)
  const [discussionSortBy, setDiscussionSortBy] = useState("noUpvote")
  const [discussionSortDirection, setDiscussionSortDirection] = useState("desc")

  useEffect(() => {
    document.title = `Course Detail - ${GLOBALS.APPLICATION_NAME}`
  }, [])

  // Fetch Enrolled Users and Course Data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const courseData = await getCourse(id)
        if (!courseData) throw new Error("Course not found")
        setCourse(courseData)

        const usersData = await usersEnrolledCourse(id, currentPage, itemsPerPage, sortBy, sortDir, searchQuery)
        if (!usersData) throw new Error("User not found")
        setEnrolledUsers(usersData.content)
        setTotalPages(usersData.totalPages)
        setTotalElements(usersData.totalElements)
      } catch (error) {
        console.error("Error fetching data:", error.message)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, currentPage, itemsPerPage, sortBy, sortDir, searchQuery])

  // Fetch Discussion Data
  useEffect(() => {
    async function fetchDiscussionData() {
      if (!id) return
      try {
        setDiscussionLoading(true)
        const discussionData = await getCourseDiscussion(id, {
          page: discussionPage,
          size: 5,
          sortBy: discussionSortBy,
          sortDirection: discussionSortDirection
        })
        const replyPromises = discussionData.content.map((comment) => getDiscussionReply(comment.id).catch(() => []))
        const repliesData = await Promise.all(replyPromises)
        const allReplies = repliesData.flat()
        const transformedMessages = await transformDiscussionData(discussionData.content, allReplies)
        setMessages(transformedMessages)
        setDiscussionTotalPages(discussionData.totalPages)
      } catch (error) {
        setDiscussionError(error.message)
      } finally {
        setDiscussionLoading(false)
      }
    }
    fetchDiscussionData()
  }, [id, discussionPage, discussionSortBy, discussionSortDirection])

  const transformDiscussionData = async (discussionData, replyData) => {
    return discussionData.map((comment) => {
      const commentReplies = replyData.filter((reply) => reply.replyId === comment.id)
      const avatarUrl = comment.createdBy.avatar || "/placeholder.svg?height=40&width=40"

      const repliesWithAvatars = commentReplies.map((reply) => ({
        id: reply.id,
        user: reply.createdBy.username,
        text: reply.comment,
        time: reply.createdAt,
        avatar: reply.createdBy.avatar || "/placeholder.svg?height=40&width=40",
        likes: reply.noUpvote,
        liked: reply.voted
      }))

      return {
        id: comment.id,
        user: comment.createdBy.username,
        text: comment.comment,
        time: comment.createdAt,
        avatar: avatarUrl,
        likes: comment.noUpvote,
        liked: comment.voted,
        replies: repliesWithAvatars,
        showReplies: false
      }
    })
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortDir("asc")
    }
    setCurrentPage(0)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page - 1)
  }

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value))
    setCurrentPage(0)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    setPosting(true)
    try {
      const data = {
        comment: newMessage,
        courseId: Number.parseInt(id),
        commentReply: replyingTo ? Number.parseInt(replyingTo.id) : null
      }
      await discussionCourse(data)
      setNewMessage("")
      setReplyingTo(null)
      // Refresh discussion data
      const discussionData = await getCourseDiscussion(id, {
        page: discussionPage,
        size: 5,
        sortBy: discussionSortBy,
        sortDirection: discussionSortDirection
      })
      const replyPromises = discussionData.content.map((comment) => getDiscussionReply(comment.id).catch(() => []))
      const repliesData = await Promise.all(replyPromises)
      const allReplies = repliesData.flat()
      const transformedMessages = await transformDiscussionData(discussionData.content, allReplies)
      setMessages(transformedMessages)
    } catch (error) {
      setDiscussionError(`Failed to send message: ${error.message}`)
    } finally {
      setPosting(false)
    }
  }

  const toggleLike = async (messageId, isReply = false, parentId = null) => {
    try {
      const message = isReply
        ? messages.find((m) => m.id === parentId).replies.find((r) => r.id === messageId)
        : messages.find((m) => m.id === messageId)

      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (isReply && msg.id === parentId) {
            return {
              ...msg,
              replies: msg.replies.map((reply) =>
                reply.id === messageId
                  ? {
                    ...reply,
                    liked: !reply.liked,
                    likes: reply.liked ? reply.likes - 1 : reply.likes + 1
                  }
                  : reply
              )
            }
          }
          if (!isReply && msg.id === messageId) {
            return {
              ...msg,
              liked: !msg.liked,
              likes: msg.liked ? msg.likes - 1 : msg.likes + 1
            }
          }
          return msg
        })
      )

      if (!message.liked) {
        await upvoteDiscussion(messageId)
      } else {
        await unUpvoteDiscussion(messageId)
      }
    } catch (error) {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (isReply && msg.id === parentId) {
            return {
              ...msg,
              replies: msg.replies.map((reply) =>
                reply.id === messageId
                  ? {
                    ...reply,
                    liked: !reply.liked,
                    likes: reply.liked ? reply.likes - 1 : reply.likes + 1
                  }
                  : reply
              )
            }
          }
          if (!isReply && msg.id === messageId) {
            return {
              ...msg,
              liked: !msg.liked,
              likes: msg.liked ? msg.likes - 1 : msg.likes + 1
            }
          }
          return msg
        })
      )
      setDiscussionError(`Failed to toggle like: ${error.message}`)
    }
  }

  const toggleReplies = (messageId) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => (msg.id === messageId ? { ...msg, showReplies: !msg.showReplies } : msg))
    )
  }

  const handleReplyClick = (message) => {
    setReplyingTo(message)
  }

  const formatTime = (timeString) => {
    try {
      const date = new Date(timeString)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (e) {
      return timeString
    }
  }

  const cancelReply = () => {
    setReplyingTo(null)
  }

  // Update the MessageActions component to use your theme colors more consistently
  const MessageActions = ({ message, isReply = false, parentId = null }) => (
    <div className="flex items-center gap-3 mt-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formatTime(message.time)}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{new Date(message.time).toLocaleString()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Button
        variant="ghost"
        size="sm"
        className={`h-7 px-2 rounded-full ${message.liked ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-accent hover:text-primary"}`}
        onClick={() => toggleLike(message.id, isReply, parentId)}
      >
        <ArrowBigUp className={`h-3.5 w-3.5 mr-1 ${message.liked ? "fill-primary" : ""}`} />
        <span className="text-xs">{message.likes > 0 ? message.likes : ""}</span>
      </Button>

      {!isReply && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 rounded-full text-muted-foreground hover:bg-accent hover:text-primary"
          onClick={() => handleReplyClick(message)}
        >
          <MessageSquare className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">Reply</span>
        </Button>
      )}
    </div>
  )

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!course) return <div>Course not found</div>

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="border-border-muted bg-bg-card shadow-lg">
          <CardHeader className="pb-4 border-b border-border-muted">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-text-primary">
                Course: {course.title} ({totalElements} enrolled)
              </CardTitle>
              <Button onClick={() => navigate(-1)}>Back</Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Enrolled Users Section */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by username..."
                    className="pl-10 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select onValueChange={handleItemsPerPageChange} value={itemsPerPage.toString()}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Items per page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="20">20 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border-muted mb-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("user.id")}>
                      ID {sortBy === "user.id" && (sortDir === "asc" ? "▲" : "▼")}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("user.username")}>
                      Username {sortBy === "user.username" && (sortDir === "asc" ? "▲" : "▼")}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("enrolledAt")}>
                      Enrolled At {sortBy === "enrolledAt" && (sortDir === "asc" ? "▲" : "▼")}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("progress")}>
                      Progress {sortBy === "progress" && (sortDir === "asc" ? "▲" : "▼")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrolledUsers.map((enrollment) => (
                    <TableRow key={enrollment.user.id}>
                      <TableCell>{enrollment.user.id}</TableCell>
                      <TableCell>{enrollment.user.username}</TableCell>
                      <TableCell>{enrollment.enrolledAt}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="relative h-10 w-10">
                            <svg className="h-10 w-10 -rotate-90">
                              <circle cx="20" cy="20" r="15" strokeWidth="5" stroke="#e2e8f0" fill="none" />
                              <circle
                                cx="20"
                                cy="20"
                                r="15"
                                strokeWidth="5"
                                stroke="hsl(var(--primary))"
                                fill="none"
                                strokeDasharray={2 * Math.PI * 15}
                                strokeDashoffset={2 * Math.PI * 15 * (1 - enrollment.progress / 100)}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                              {Math.round(enrollment.progress)}%
                            </div>
                          </div>
                          <Progress value={enrollment.progress} className="w-full h-2" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-6 gap-2 mb-6">
                <Button variant="ghost" onClick={() => handlePageChange(currentPage)} disabled={currentPage === 0}>
                  Previous
                </Button>
                {[...Array(totalPages)].map((_, index) => (
                  <Button
                    key={index}
                    variant={currentPage === index ? "default" : "ghost"}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  onClick={() => handlePageChange(currentPage + 2)}
                  disabled={currentPage === totalPages - 1}
                >
                  Next
                </Button>
              </div>
            )}

            {/* Course Discussion Section */}
            <Separator className="my-6" />
            <h3 className="text-lg font-semibold text-text-primary mb-4">Course Discussion</h3>
            {/* Update the sort controls to use your theme colors */}
            <div className="flex gap-3 items-center mb-4">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>Sort by:</span>
              </div>
              <Select value={discussionSortBy} onValueChange={setDiscussionSortBy}>
                <SelectTrigger className="w-[140px] h-8 text-sm bg-muted text-foreground border-border">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="noUpvote">Upvotes</SelectItem>
                  <SelectItem value="createdAt">Date Created</SelectItem>
                </SelectContent>
              </Select>
              <Select value={discussionSortDirection} onValueChange={setDiscussionSortDirection}>
                <SelectTrigger className="w-[140px] h-8 text-sm bg-muted text-foreground border-border">
                  <SelectValue placeholder="Sort direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Update the discussion section styling to use your theme colors
            Replace the ScrollArea section with this improved version */}
            <ScrollArea className="h-[400px] mb-4 pr-4">
              {discussionLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground mt-4">Loading discussion...</p>
                </div>
              ) : discussionError ? (
                <div className="mb-4 p-3 bg-destructive/10 rounded-lg text-destructive text-sm">{discussionError}</div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mb-2 opacity-30" />
                  <p>No discussions yet. Be the first to comment!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="mb-6">
                    <div className="flex gap-3">
                      <Avatar className="h-9 w-9 flex-shrink-0 border border-border">
                        <AvatarImage src={message.avatar} alt={message.user} />
                        <AvatarFallback className="bg-muted text-foreground">{message.user[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-card rounded-lg p-3 border border-border shadow-sm">
                          <p className="font-medium text-sm text-card-foreground">{message.user}</p>
                          <p className="text-sm mt-1 text-muted-foreground whitespace-pre-wrap">{message.text}</p>
                        </div>
                        <MessageActions message={message} />

                        {message.replies.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 h-7 px-3 text-primary hover:bg-primary/10 hover:text-primary rounded-full"
                            onClick={() => toggleReplies(message.id)}
                          >
                            {message.showReplies ? (
                              <ChevronUp className="h-3.5 w-3.5 mr-1" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 mr-1" />
                            )}
                            <span className="text-xs">
                              {message.showReplies ? "Hide" : "View"} {message.replies.length}{" "}
                              {message.replies.length === 1 ? "reply" : "replies"}
                            </span>
                          </Button>
                        )}

                        {message.showReplies && message.replies.length > 0 && (
                          <div className="ml-6 mt-3 space-y-4 pl-3 border-l-2 border-border">
                            {message.replies.map((reply) => (
                              <div key={reply.id} className="flex gap-3">
                                <Avatar className="h-8 w-8 flex-shrink-0 border border-border">
                                  <AvatarImage src={reply.avatar} alt={reply.user} />
                                  <AvatarFallback className="bg-muted text-foreground">{reply.user[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="bg-card rounded-lg p-3 border border-border shadow-sm">
                                    <p className="font-medium text-sm text-card-foreground">{reply.user}</p>
                                    <p className="text-sm mt-1 text-muted-foreground whitespace-pre-wrap">
                                      {reply.text}
                                    </p>
                                  </div>
                                  <MessageActions message={reply} isReply={true} parentId={message.id} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>

            {discussionTotalPages > 1 && (
              // Update the pagination buttons to use your theme colors
              <div className="flex justify-between items-center w-full mb-3">
                <Button
                  disabled={discussionPage === 0}
                  onClick={() => setDiscussionPage(discussionPage - 1)}
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {discussionPage + 1} of {discussionTotalPages}
                </span>
                <Button
                  disabled={discussionPage === discussionTotalPages - 1}
                  onClick={() => setDiscussionPage(discussionPage + 1)}
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                >
                  Next
                </Button>
              </div>
            )}

            {/* Update the reply indicator styling */}
            {replyingTo && (
              <div className="mb-3 p-2 bg-muted rounded-lg border border-border w-full">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Replying to <span className="font-medium text-primary">{replyingTo.user}</span>
                  </p>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={cancelReply}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">{replyingTo.text}</p>
              </div>
            )}

            {/* Update the comment input styling */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 w-full">
              <Avatar className="h-9 w-9 flex-shrink-0 border border-border">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="You" />
                <AvatarFallback className="bg-muted text-foreground">Y</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex items-center gap-2 bg-card rounded-full px-4 border border-input focus-within:border-primary transition-colors">
                <Input
                  type="text"
                  placeholder={replyingTo ? `Reply to ${replyingTo.user}...` : "Write a comment..."}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 h-10 text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-foreground placeholder:text-muted-foreground"
                  disabled={posting}
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="ghost"
                  className={`h-8 w-8 p-0 rounded-full ${newMessage.trim() ? "text-primary hover:bg-primary/10" : "text-muted-foreground"}`}
                  disabled={posting || !newMessage.trim()}
                >
                  {posting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default CourseDetail

