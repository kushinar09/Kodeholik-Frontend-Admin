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
  const [currentTitleCourseDetail, setCurrentTitleCourseDetail] = useState("")
  const [currentTitleExam, setCurrentTitleExam] = useState("")
  const [currentTitleUser, setCurrentTitleUser] = useState("")
  const [currentTitleTag, setCurrentTitleTag] = useState("")
  const [currentTitleChapter, setCurrentTitleChapter] = useState("")
  const [currentTitleLesson, setCurrentTitleLesson] = useState("")

  useEffect(() => {
    if (location.pathname === "/problem") {
      setActiveState("problemList")
    } else if (location.pathname === "/problem/create") {
      setActiveState("problemCreate")
    } else if (/^\/problem\/[\w-]+$/.test(location.pathname)) {
      setActiveState("problemEdit")
    } else if (location.pathname === "/exam") {
      setActiveState("examList")
      setCurrentTitleExam("Examination")
    } else if (location.pathname === "/exam/create") {
      setActiveState("examCreate")
      setCurrentTitleExam("Examination")
    } else if (location.pathname.includes("/exam/result")) {
      setActiveState("examResult")
      setCurrentTitleExam("Examination")
    } else if (location.pathname.includes("/exam/edit")) {
      setActiveState("examEdit")
      setCurrentTitleExam("Examination")
    } else if (location.pathname === "/user") {
      setActiveState("userList")
      setCurrentTitleUser("Users")
    } else if (location.pathname === "/user/create") {
      setActiveState("userCreate")
    } else if (location.pathname.includes("/user/edit")) {
      setActiveState("userEdit")
    } else if (location.pathname === "/tag") {
      setActiveState("tagList")
      setCurrentTitleUser("Tags")
    } else if (location.pathname === "/course") {
      setActiveState("courseList")
    } else if (location.pathname === "/course/add") {
      setActiveState("createCourse")
    } else if (/^\/course\/[\w-]+$/.test(location.pathname)) {
      setActiveState("updateCourse")
      setCurrentTitleCourse("Java Beginner")
    } else if (location.pathname === "/chapter") {
      setActiveState("chapterList")
    } else if (location.pathname === "/chapter/add") {
      setActiveState("createChapter")
    } else if (/^\/chapter\/[\w-]+$/.test(location.pathname)) {
      setActiveState("updateChapter")
    } else if (location.pathname === "/lesson") {
      setActiveState("lessonList")
    } else if (location.pathname === "/lesson/add") {
      setActiveState("createLesson")
    } else if (/^\/lesson\/[\w-]+$/.test(location.pathname)) {
      setActiveState("updateLesson")
    } else {
      setActiveState("")
    }
  }, [location.pathname])

  useEffect(() => {
    const pathname = location.pathname
    const headerMap = {
      // Problem
      "/problem": [{ title: "Problem", url: "/" }],
      "/problem/create": [
        { title: "Problem", url: "/problem" },
        { title: "Create Problem", url: "#" }
      ],
      "/tag": [{ title: "Tags", url: "/" }],
      // Exam
      "/exam": [{ title: "Examination", url: "/" }],
      "/exam/create": [
        { title: "Examination", url: "/exam" },
        { title: "Create Exam", url: "#" }
      ],
      "/exam/result": [
        { title: "Examination", url: "/exam" },
        { title: "Exam Result", url: "#" }
      ],
      "/exam/edit": [
        { title: "Examination", url: "/exam" },
        { title: "Edit Exam", url: "#" }
      ],
      // User
      "/user": [{ title: "Users", url: "/" }],
      "/user/create": [
        { title: "Users", url: "/user" },
        { title: "Create User", url: "#" }
      ],
      "/user/edit": [
        { title: "Users", url: "/user" },
        { title: "Edit User", url: "#" }
      ],
      // Course
      "/course": [{ title: "Course", url: "/" }],
      "/course/add": [
        { title: "Course", url: "/course" },
        { title: "Create Course", url: "#" }
      ],
      "/chapter": [{ title: "Chapter", url: "/" }],
      "/lesson": [{ title: "Lesson", url: "/" }],
      "/chapter/add": [
        { title: "Chapter", url: "/chapter" },
        { title: "Create Chapter", url: "#" }
      ],
      "/lesson/add": [
        { title: "Lesson", url: "/lesson" },
        { title: "Create Lesson", url: "#" }
      ]
    }

    const examMatch = location.pathname.match(/^\/exam\/[\w-]+$/)
    const examEditMatch = location.pathname.match(/^\/exam\/[^/]+\/[^/]+$/)
    const userEditMatch = location.pathname.match(/^\/user\/[^/]+\/[^/]+$/)
    const userMatch = location.pathname.match(/^\/user\/[\w-]+$/)
    const tagMatch = location.pathname.match(/^\/tag\/[\w-]+$/)
    const problemMatch = pathname.match(/^\/problem\/[\w-]+$/)
    const courseMatch = pathname.match(/^\/course\/[\w-]+$/)
    const chapterMatch = pathname.match(/^\/chapter\/[\w-]+$/)
    const lessonMatch = pathname.match(/^\/lesson\/[\w-]+$/)

    if (pathname !== "/problem/create" && problemMatch) {
      headerMap[pathname] = [
        { title: "Problem", url: "/problem" },
        { title: currentTitleProblem, url: "#" }
      ]
    }

    if (pathname !== "/course/add" && courseMatch) {
      headerMap[pathname] = [
        { title: "Course", url: "/course" },
        { title: currentTitleCourse, url: "#" }
      ]
    }

    if (location.pathname !== "/exam/create" && examMatch) {
      headerMap[location.pathname] = [
        { title: "Examination", url: "/exam" },
        { title: currentTitleExam, url: "#" }
      ]
    }

    if (location.pathname === "/exam/create" && examMatch) {
      headerMap[location.pathname] = [
        { title: "Examination", url: "/exam" },
        { title: "Create Exam", url: "#" }
      ]
    }

    if (examEditMatch) {
      if (location.pathname.includes("edit")) {
        headerMap[location.pathname] = [
          { title: "Examination", url: "/exam" },
          { title: "Edit Exam", url: "#" }
        ]
      }
      else {
        headerMap[location.pathname] = [
          { title: "Examination", url: "/exam" },
          { title: "Exam Result", url: "#" }
        ]
      }
    }

    if (userEditMatch) {
      headerMap[location.pathname] = [
        { title: "Users", url: "/user" },
        { title: "Edit User", url: "#" }
      ]
    }

    if (location.pathname !== "/user/create" && userMatch) {
      headerMap[location.pathname] = [
        { title: "Users", url: "/user" },
        { title: "Create User", url: "/user/create" }
      ]
    }

    if (tagMatch) {
      headerMap[location.pathname] = [
        { title: "Tags", url: "/user" },
        { title: currentTitleTag, url: "#" }
      ]
    }

    if (pathname !== "/chapter/add" && chapterMatch) {
      headerMap[pathname] = [
        { title: "Chapter", url: "/chapter" },
        { title: currentTitleChapter, url: "#" }
      ]
    }

    if (pathname !== "/lesson/add" && lessonMatch) {
      headerMap[pathname] = [
        { title: "Lesson", url: "/lesson" },
        { title: currentTitleLesson, url: "#" }
      ]
    }

    if (pathname.startsWith("/users")) {
      setHeaderData([
        { title: "Users", url: "/users" },
        { title: "Create User", url: "/users/create" }
      ])
      return
    }

    setHeaderData(headerMap[pathname] || [{ title: "Dashboard", url: "/" }])
  }, [location.pathname, currentTitleProblem, currentTitleCourse, currentTitleChapter, currentTitleLesson])

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
          {activeState === "" && <Overview />}
          {/* Problem */}
          {activeState === "problemList" && <ProblemList onNavigate={handleNavigation} />}
          {activeState === "problemCreate" && <ProblemCreator onNavigate={handleNavigation} />}
          {activeState === "problemEdit" && <ProblemEdit onNavigate={handleNavigation} setCurrentTitleProblem={setCurrentTitleProblem} />}

          {/* Exam */}
          {activeState === "examList" && <ExamList onNavigate={handleNavigation} />}
          {activeState === "examCreate" && <CreateExam onNavigate={handleNavigation} />}
          {activeState === "examResult" && <ExamResult onNavigate={handleNavigation} />}
          {activeState === "examEdit" && <EditExam onNavigate={handleNavigation} />}

          {/* User */}
          {activeState === "userList" && <UserList onNavigate={handleNavigation} />}
          {activeState === "userCreate" && <CreateUser onNavigate={handleNavigation} />}
          {activeState === "userEdit" && <EditUser onNavigate={handleNavigation} />}
          {activeState === "tagList" && <TagList onNavigate={handleNavigation} />}

          {/* Course */}
          {activeState === "courseList" && <CourseList onNavigate={handleNavigation} />}
          {activeState === "createCourse" && <CreateCourse onNavigate={handleNavigation} />}
          {activeState === "updateCourse" && <UpdateCourse onNavigate={handleNavigation} setCurrentTitleCourse={setCurrentTitleCourse} />}
          {activeState === "chapterList" && <ChapterList onNavigate={handleNavigation} />}
          {activeState === "createChapter" && <CreateChapter onNavigate={handleNavigation} />}
          {activeState === "updateChapter" && <UpdateChapter onNavigate={handleNavigation} setCurrentTitleChapter={setCurrentTitleChapter} />}
          {activeState === "lessonList" && <LessonList onNavigate={handleNavigation} />}
          {activeState === "createLesson" && <CreateLesson onNavigate={handleNavigation} />}
          {activeState === "updateLesson" && <UpdateLesson onNavigate={handleNavigation} setCurrentTitleLesson={setCurrentTitleLesson} />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

