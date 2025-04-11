"use client"

import { useEffect, useState, memo, useMemo } from "react"
import { useLocation, useNavigate, Routes, Route, Navigate, useParams } from "react-router-dom"
import Header from "@/components/layout/header"
import { AppSidebar } from "@/components/layout/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ProtectedRoute } from "@/provider/ProtectRoute"

// Import all your page components
import Overview from "../overview"
import ProblemList from "../problem/ProblemList"
import ProblemCreator from "../problem/ProblemCreate"
import ProblemEdit from "../problem/ProblemEdit"
import CourseList from "../course/CourseList/ViewListCourse"
import CreateCourse from "../course/CourseCreate/CreateCourse"
import UpdateCourse from "../course/CourseUpdate/UpdateCourse"
import ExamList from "../exam/list"
import { CreateExam } from "../exam/create"
import { EditExam } from "../exam/edit"
import { ExamResult } from "../exam/result"
import UserList from "../users/list"
import CreateUser from "../users/create"
import EditUser from "../users/edit"
import TagList from "../tag/list"
import ChapterList from "../chapter/ChapterList/ChapterList"
import CreateChapter from "../chapter/ChapterCreate/CreateChapter"
import UpdateChapter from "../chapter/ChapterUpdate/UpdateChapter"
import LessonList from "../lesson/LessonList/LessonList"
import CreateLesson from "../lesson/LessonCreate"
import UpdateLesson from "../lesson/LessonUpdate"
import CourseDetail from "../course/CourseDetail/CourseDetail"
import NotificationsPage from "../notification"

// Memoized sidebar to prevent re-renders
const MemoizedSidebar = memo(function MemoizedSidebar({ onNavigate }) {
  return <AppSidebar onNavigate={onNavigate} />
})

// Define route configuration
const routeConfig = [
  // Dashboard
  {
    path: "/",
    component: Overview,
    breadcrumb: [{ title: "Dashboard", url: "/" }],
    role: null
  },

  // Notifications
  {
    path: "/notifications",
    component: NotificationsPage,
    breadcrumb: [{ title: "Notifications", url: "#" }],
    role: null
  },

  // Problem routes
  {
    path: "/problem",
    component: ProblemList,
    breadcrumb: [{ title: "Problem", url: "/problem" }],
    role: "TEACHER"
  },
  {
    path: "/problem/create",
    component: ProblemCreator,
    breadcrumb: [
      { title: "Problem", url: "/problem" },
      { title: "Create Problem", url: "#" }
    ],
    role: "TEACHER"
  },
  {
    path: "/problem/:id",
    component: ProblemEdit,
    breadcrumb: [
      { title: "Problem", url: "/problem" },
      { title: "Edit Problem", url: "#", dynamic: true }
    ],
    role: "TEACHER",
    setTitle: "setCurrentTitleProblem"
  },

  // Course routes
  {
    path: "/course",
    component: CourseList,
    breadcrumb: [{ title: "Course", url: "/course" }],
    role: "TEACHER"
  },
  {
    path: "/course/add",
    component: CreateCourse,
    breadcrumb: [
      { title: "Course", url: "/course" },
      { title: "Create Course", url: "#" }
    ],
    role: "TEACHER"
  },
  {
    path: "/course/:id",
    component: CourseDetail,
    breadcrumb: [
      { title: "Course", url: "/course" },
      { title: "Course Detail", url: "#", dynamic: true }
    ],
    role: "TEACHER",
    setTitle: "setCurrentTitleCourse"
  },
  {
    path: "/course/edit/:id",
    component: UpdateCourse,
    breadcrumb: [
      { title: "Course", url: "/course" },
      { title: "Edit Course", url: "#", dynamic: true }
    ],
    role: "TEACHER",
    setTitle: "setCurrentTitleCourse"
  },

  // Chapter routes
  {
    path: "/chapter",
    component: ChapterList,
    breadcrumb: [{ title: "Chapter", url: "/chapter" }],
    role: "TEACHER"
  },
  {
    path: "/chapter/add",
    component: CreateChapter,
    breadcrumb: [
      { title: "Chapter", url: "/chapter" },
      { title: "Create Chapter", url: "#" }
    ],
    role: "TEACHER"
  },
  {
    path: "/chapter/:id",
    component: UpdateChapter,
    breadcrumb: [
      { title: "Chapter", url: "/chapter" },
      { title: "Edit Chapter", url: "#", dynamic: true }
    ],
    role: "TEACHER",
    setTitle: "setCurrentTitleChapter"
  },

  // Lesson routes
  {
    path: "/lesson",
    component: LessonList,
    breadcrumb: [{ title: "Lesson", url: "/lesson" }],
    role: "TEACHER"
  },
  {
    path: "/lesson/add",
    component: CreateLesson,
    breadcrumb: [
      { title: "Lesson", url: "/lesson" },
      { title: "Create Lesson", url: "#" }
    ],
    role: "TEACHER"
  },
  {
    path: "/lesson/:id",
    component: UpdateLesson,
    breadcrumb: [
      { title: "Lesson", url: "/lesson" },
      { title: "Edit Lesson", url: "#", dynamic: true }
    ],
    role: "TEACHER",
    setTitle: "setCurrentTitleLesson"
  },

  // Exam routes
  {
    path: "/exam",
    component: ExamList,
    breadcrumb: [{ title: "Examination", url: "/exam" }],
    role: "EXAMINER"
  },
  {
    path: "/exam/create",
    component: CreateExam,
    breadcrumb: [
      { title: "Examination", url: "/exam" },
      { title: "Create Exam", url: "#" }
    ],
    role: "EXAMINER"
  },
  {
    path: "/exam/edit/:code",
    component: EditExam,
    breadcrumb: [
      { title: "Examination", url: "/exam" },
      { title: "Edit Exam", url: "#", dynamic: true }
    ],
    role: "EXAMINER",
    setTitle: "setCurrentTitleExam"
  },
  {
    path: "/exam/result/:code",
    component: ExamResult,
    breadcrumb: [
      { title: "Examination", url: "/exam" },
      { title: "Exam Result", url: "#" }
    ],
    role: "EXAMINER"
  },

  // User routes
  {
    path: "/user",
    component: UserList,
    breadcrumb: [{ title: "Users", url: "/user" }],
    role: "ADMIN"
  },
  {
    path: "/user/create",
    component: CreateUser,
    breadcrumb: [
      { title: "Users", url: "/user" },
      { title: "Create User", url: "#" }
    ],
    role: "ADMIN"
  },
  {
    path: "/user/edit/:id",
    component: EditUser,
    breadcrumb: [
      { title: "Users", url: "/user" },
      { title: "Edit User", url: "#" }
    ],
    role: "ADMIN",
    setTitle: "setCurrentTitleUser"
  },

  // Tag routes
  {
    path: "/tag",
    component: TagList,
    breadcrumb: [{ title: "Tags", url: "/tag" }],
    role: "ADMIN"
  }
]

export default function Dashboard() {
  const location = useLocation()
  const navigate = useNavigate()

  // State for dynamic titles
  const [currentTitleProblem, setCurrentTitleProblem] = useState("")
  const [currentTitleCourse, setCurrentTitleCourse] = useState("")
  const [currentTitleExam, setCurrentTitleExam] = useState("")
  const [currentTitleUser, setCurrentTitleUser] = useState("")
  const [currentTitleTag, setCurrentTitleTag] = useState("")
  const [currentTitleChapter, setCurrentTitleChapter] = useState("")
  const [currentTitleLesson, setCurrentTitleLesson] = useState("")

  // Create a map of title setters for dynamic use
  const titleSetters = {
    setCurrentTitleProblem,
    setCurrentTitleCourse,
    setCurrentTitleExam,
    setCurrentTitleUser,
    setCurrentTitleTag,
    setCurrentTitleChapter,
    setCurrentTitleLesson
  }

  // Find the current route configuration based on the path
  const getCurrentRouteConfig = () => {
    // First try exact match
    let config = routeConfig.find((route) => route.path === location.pathname)

    // If no exact match, try matching patterns with parameters
    if (!config) {
      config = routeConfig.find((route) => {
        // Convert route path to regex pattern
        const pattern = route.path.replace(/:\w+/g, "([^/]+)")
        const regex = new RegExp(`^${pattern}$`)
        return regex.test(location.pathname)
      })
    }

    return config || routeConfig[0] // Default to dashboard if no match
  }

  // Get current breadcrumb data
  const [headerData, setHeaderData] = useState([])

  useEffect(() => {
    const currentConfig = getCurrentRouteConfig()

    if (currentConfig) {
      // Deep clone the breadcrumb to avoid modifying the original
      const breadcrumb = JSON.parse(JSON.stringify(currentConfig.breadcrumb || []))

      // Handle dynamic titles in breadcrumbs
      if (breadcrumb.some((item) => item.dynamic)) {
        const dynamicItem = breadcrumb.find((item) => item.dynamic)
        if (dynamicItem && currentConfig.setTitle) {
          const titleKey = currentConfig.setTitle.replace("set", "")
          const titleValue = eval(titleKey.charAt(0).toLowerCase() + titleKey.slice(1))
          if (titleValue) {
            dynamicItem.title = titleValue
          }
        }
      }

      setHeaderData(breadcrumb)
    } else {
      setHeaderData([{ title: "Dashboard", url: "/" }])
    }
  }, [
    location.pathname,
    currentTitleProblem,
    currentTitleCourse,
    currentTitleExam,
    currentTitleUser,
    currentTitleTag,
    currentTitleChapter,
    currentTitleLesson
  ])

  const handleNavigation = (newPath) => {
    navigate(newPath)
  }

  // Helper component to handle parameter extraction and role protection
  function RouteWrapper({ Component, route, onNavigate, titleSetters }) {
    const params = useParams()

    // Create props with navigation handler
    const componentProps = {
      onNavigate
    }

    // Add title setter if specified in route config
    if (route.setTitle && titleSetters[route.setTitle]) {
      componentProps[route.setTitle] = titleSetters[route.setTitle]
    }

    // Apply role protection if needed
    if (route.role) {
      return (
        <ProtectedRoute allowedRoles={[route.role]}>
          <Component {...componentProps} />
        </ProtectedRoute>
      )
    }

    return <Component {...componentProps} />
  }

  // Create route components with proper props
  const routeComponents = useMemo(() => {
    const handleNavigationMemoized = (newPath) => {
      navigate(newPath)
    }

    return routeConfig.map((route) => {
      const RouteComponent = route.component

      return (
        <Route
          key={route.path}
          path={route.path}
          element={
            <RouteWrapper
              Component={RouteComponent}
              route={route}
              onNavigate={handleNavigationMemoized}
              titleSetters={titleSetters}
            />
          }
        />
      )
    })
  }, [navigate, titleSetters])

  return (
    <SidebarProvider>
      <MemoizedSidebar onNavigate={routeComponents[0].props.element.props.onNavigate} />
      <SidebarInset>
        <Header headerData={headerData} onNavigate={handleNavigation} />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Routes>
            {routeComponents}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
