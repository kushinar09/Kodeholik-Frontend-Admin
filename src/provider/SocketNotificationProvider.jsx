"use client"
import { createContext, useContext, useEffect, useState } from "react"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import { ENDPOINTS } from "@/lib/constants"
import { useAuth } from "./AuthProvider"
import { toast } from "sonner"

// Create context
const SocketContext = createContext(undefined)

// Create provider
export const SocketProvider = ({ children }) => {
  const [stompClient, setStompClient] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [connected, setConnected] = useState(false)
  const { apiCall, user, isAuthenticated } = useAuth()
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMorePages, setHasMorePages] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [notiToken, setNotiToken] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const updateDocumentTitle = (count) => {
    const baseTitle = document.title.replace(/^\(\d+\) /, "")
    document.title = count > 0 ? `(${count}) ${baseTitle}` : baseTitle
  }

  // Fetch notification token
  useEffect(() => {
    const fetchNotificationToken = async () => {
      try {
        const response = await apiCall(ENDPOINTS.GET_NOTIFICATIONS_TOKEN)
        if (!response.ok) throw new Error("Failed to fetch notification token")
        const token = await response.text()
        setNotiToken(token)
      } catch (error) {
        console.error("Error fetching notification token:", error)
      }
    }

    fetchNotificationToken()
  }, [])

  // Initialize socket connection
  useEffect(() => {
    if (!isAuthenticated || !notiToken) return

    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const response = await apiCall(ENDPOINTS.GET_NOTIFICATIONS + "?page=0")
        if (!response.ok) throw new Error("Failed to fetch notifications")

        // Handle empty response
        const text = await response.text()
        if (!text || text.trim() === "") {
          setNotifications([])
          setHasMorePages(false)
          return
        }

        const data = JSON.parse(text)
        setNotifications(data.content)
        setTotalPages(data.totalPages)
        setHasMorePages(data.totalPages > 1)

        // Count unread notifications and update title
        const count = data.content.filter((n) => n.unread).length
        setUnreadCount(count)
        updateDocumentTitle(count)
      } catch (error) {
        console.error("Error fetching notifications:", error)
      }
    }

    fetchNotifications()

    // Create and configure STOMP client
    const client = new Client({
      webSocketFactory: () =>
        new SockJS(ENDPOINTS.WEBSOCKET_NOTIFICATION.replace(":token", notiToken), null, { withCredentials: true }),
      debug: (str) => {
        // console.log("STOMP: " + str)
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    })

    // Handle connection
    client.onConnect = (frame) => {
      setConnected(true)

      client.subscribe("/notification/" + user.username, (message) => {
        try {
          const notification = {
            ...JSON.parse(message.body),
            unread: true
          }
          setNotifications((prev) => {
            const newNotifications = [notification, ...prev]
            const newUnreadCount = newNotifications.filter((n) => n.unread).length
            setUnreadCount(newUnreadCount)
            updateDocumentTitle(newUnreadCount)
            return newNotifications
          })

          // Show toast notification
          toast.info("Notification", {
            description: notification.content,
            action:
              notification.link && notification.link !== ""
                ? {
                  label: "View",
                  onClick: () => (window.location.href = notification.link)
                }
                : undefined
          })
        } catch (error) {
          console.error("Error parsing notification:", error)
        }
      })

      client.subscribe("/topic/disconnect/" + user.username, (message) => {
        console.error("Disconnect:", message.body)
        client.deactivate()
        setConnected(false)
      })
    }

    // Handle errors
    client.onStompError = (frame) => {
      console.error("STOMP error: " + frame.headers["message"])
      console.error("Additional details: " + frame.body)
      setConnected(false)
    }

    // Activate the client
    client.activate()
    setStompClient(client)

    // Clean up on unmount
    return () => {
      if (client && client.active) {
        client.deactivate()
      }
    }
  }, [isAuthenticated, notiToken])

  // Fetch more notifications (for infinite scroll)
  const fetchMoreNotifications = async () => {
    if (!hasMorePages) return

    const nextPage = currentPage + 1

    try {
      const response = await apiCall(ENDPOINTS.GET_NOTIFICATIONS + `?page=${nextPage}`)
      if (!response.ok) throw new Error("Failed to fetch more notifications")

      const text = await response.text()
      if (!text || text.trim() === "") return

      const data = JSON.parse(text)

      // Append new notifications to existing ones
      setNotifications((prev) => {
        const updatedNotifications = [...prev, ...data.content]
        const newUnreadCount = updatedNotifications.filter((n) => n.unread).length
        setUnreadCount(newUnreadCount)
        updateDocumentTitle(newUnreadCount)
        return updatedNotifications
      })

      setCurrentPage(nextPage)
      setHasMorePages(nextPage < data.totalPages - 1)
    } catch (error) {
      console.error("Error fetching more notifications:", error)
    }
  }

  // Fetch notifications for a specific page (for pagination)
  const fetchNotificationsPage = async (page) => {
    try {
      const response = await apiCall(ENDPOINTS.GET_NOTIFICATIONS + `?page=${page}`)
      if (!response.ok) throw new Error("Failed to fetch notifications")

      const text = await response.text()
      if (!text || text.trim() === "") {
        return { content: [], totalPages: 0 }
      }

      const data = JSON.parse(text)
      return data
    } catch (error) {
      console.error("Error fetching notifications page:", error)
      return { content: [], totalPages: 0 }
    }
  }

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      // const response = await apiCall(`${ENDPOINTS.MARK_NOTIFICATION_READ}/${id}`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      // })

      // if (!response.ok) throw new Error("Failed to mark notification as read")

      // Update local state
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, unread: false } : n)))

      // Update unread count and document title
      const newUnreadCount = notifications.filter((n) => n.id !== id && n.unread).length
      setUnreadCount(newUnreadCount)
      updateDocumentTitle(newUnreadCount)
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // const response = await apiCall(ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json"
      //   }
      // })

      // if (!response.ok) throw new Error("Failed to mark notifications as read")

      // Update local state
      setNotifications(notifications.map((n) => ({ ...n, unread: false })))

      // Update unread count and document title
      setUnreadCount(0)
      updateDocumentTitle(0)
    } catch (error) {
      console.error("Error marking notifications as read:", error)
    }
  }

  return (
    <SocketContext.Provider
      value={{
        notifications,
        connected,
        markAsRead,
        markAllAsRead,
        fetchMoreNotifications,
        fetchNotificationsPage,
        hasMorePages,
        totalPages,
        currentPage,
        setCurrentPage,
        unreadCount
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

// Custom hook to use the socket context
export const useSocket = () => {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}

