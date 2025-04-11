"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"
import { useSocket } from "@/provider/SocketNotificationProvider"
import { useAuth } from "@/provider/AuthProvider"

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth()
  const { fetchNotificationsPage, totalPages } = useSocket()
  const [currentPage, setCurrentPage] = useState(0)
  const [pageNotifications, setPageNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch notifications for the current page
  useEffect(() => {
    const loadNotifications = async () => {
      if (!isAuthenticated) return

      setLoading(true)
      const data = await fetchNotificationsPage(currentPage)
      setPageNotifications(data.content || [])
      setLoading(false)
    }

    loadNotifications()
  }, [currentPage, isAuthenticated])

  // Generate pagination items
  const getPaginationItems = () => {
    const items = []
    const maxVisiblePages = 5

    // Always show first page
    items.push(
      <PaginationItem key="first" className="cursor-pointer">
        <PaginationLink onClick={() => setCurrentPage(0)} isActive={currentPage === 0}>
          1
        </PaginationLink>
      </PaginationItem>
    )

    // Show ellipsis if needed
    if (currentPage > 2) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      )
    }

    // Show pages around current page
    for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages - 2, currentPage + 1); i++) {
      if (i > 0 && i < totalPages - 1) {
        items.push(
          <PaginationItem key={i} className="cursor-pointer">
            <PaginationLink onClick={() => setCurrentPage(i)} isActive={currentPage === i}>
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        )
      }
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 3) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      )
    }

    // Always show last page if there are more than 1 page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last" className="cursor-pointer">
          <PaginationLink onClick={() => setCurrentPage(totalPages - 1)} isActive={currentPage === totalPages - 1}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }

    return items
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p>Please log in to view your notifications</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost"
          className="gap-2"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>View and manage all your notifications</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">Loading notifications...</p>
            </div>
          ) : pageNotifications.length > 0 ? (
            <div className="space-y-4">
              {pageNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn("flex items-start gap-4 p-4 border rounded-lg", !notification.read && "bg-muted/30")}
                // onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{notification.type}</h3>
                      <p className="text-sm text-muted-foreground">{notification.date}</p>
                    </div>
                    <p className="text-muted-foreground">{notification.content}</p>
                    {notification.link && (
                      <a href={notification.link} className="text-sm text-primary hover:underline">
                        View details
                      </a>
                    )}
                    {/* {!notification.read && (
                      <div className="flex justify-end mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(notification.id)
                          }}
                        >
                          Mark as read
                        </Button>
                      </div>
                    )} */}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-muted-foreground mb-2">No notifications</p>
              <p className="text-sm text-muted-foreground">When you receive notifications, they&apos;ll appear here</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem className="cursor-pointer">
                    <PaginationPrevious
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      isActive={currentPage > 0}
                    />
                  </PaginationItem>

                  {getPaginationItems()}

                  <PaginationItem className="cursor-pointer">
                    <PaginationNext
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      isActive={currentPage < totalPages - 1}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

