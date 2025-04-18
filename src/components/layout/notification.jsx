"use client"

import { Bell } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCallback, useEffect, useRef, useState } from "react"
import { useAuth } from "@/provider/AuthProvider"
import { useSocket } from "@/provider/SocketNotificationProvider"

export default function Notification() {
  const { isAuthenticated } = useAuth()
  const { notifications, markAllAsRead, markAsRead, unreadCount, fetchMoreNotifications, hasMorePages } = useSocket()
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const notificationListRef = useRef(null)

  // Handle scroll to load more notifications with useCallback to maintain reference stability
  const handleScroll = useCallback(async () => {
    if (!notificationListRef.current || loading || !hasMorePages) return

    const { scrollTop, scrollHeight, clientHeight } = notificationListRef.current

    // Check if scrolled to bottom (with a small threshold)
    if (scrollHeight - scrollTop - clientHeight <= 40) {
      setLoading(true)
      await fetchMoreNotifications()
      setLoading(false)
    }
  }, [loading, hasMorePages, fetchMoreNotifications])

  // Add scroll event listener with proper dependencies
  useEffect(() => {
    const listElement = notificationListRef.current
    if (listElement && isOpen) {
      listElement.addEventListener("scroll", handleScroll)
      return () => listElement.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll, isOpen])

  // Check for scroll position when notifications change or popover opens
  useEffect(() => {
    if (isOpen && notificationListRef.current) {
      // Trigger a check for initial scroll position
      const { scrollHeight, clientHeight } = notificationListRef.current

      // If content is just enough to trigger loading more but not enough to make scrollbar appear
      if (scrollHeight <= clientHeight && hasMorePages && !loading) {
        fetchMoreNotifications()
      }
    }
  }, [notifications, isOpen, hasMorePages, loading, fetchMoreNotifications])

  if (!isAuthenticated) return <></>

  return (
    <Popover onOpenChange={(open) => setIsOpen(open)}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative text-primary size-10">
          <Bell className="!size-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-medium">Notifications</h3>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
            <a href="/notifications">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                View all
              </Button>
            </a>
          </div>
        </div>
        <div ref={notificationListRef} className="max-h-80 overflow-y-auto">
          {notifications.length > 0 ? (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-4 px-4 py-3 border-b last:border-0",
                    notification.unread && "bg-muted/30",
                  )}
                  onClick={() => notification.unread && markAsRead(notification.id)}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{notification.type}</p>
                      <p className="text-xs text-muted-foreground">{notification.date}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.content}</p>
                    {notification.link && (
                      <a
                        href={notification.link}
                        className="text-xs text-primary hover:underline"
                        onClick={(e) => {
                          e.stopPropagation() // Prevent triggering the parent onClick
                          if (notification.unread) {
                            markAsRead(notification.id)
                          }
                        }}
                      >
                        View details
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="py-2 text-center">
                  <p className="text-xs text-muted-foreground">Loading more...</p>
                </div>
              )}
              {!loading && hasMorePages && (
                <div className="py-2 text-center">
                  <p className="text-xs text-muted-foreground">Scroll for more</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <p className="text-muted-foreground mb-2">No notifications</p>
              <p className="text-xs text-muted-foreground">When you receive notifications, they&apos;ll appear here</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

