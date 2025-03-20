
import Header from "@/components/layout/header"
import { AppSidebar } from "@/components/layout/sidebar"
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import ProblemList from "../problem/ProblemList"
import ProblemCreator from "../problem/ProblemCreate"
import ProblemEdit from "../problem/ProblemEdit"
import Overview from "../overview"
import CourseList from "../course/CourseList/ViewListCourse"
import CreateCourse from "../course/CourseCreate/CreateCourse"
import UpdateCourse from "../course/CourseUpdate/UpdateCourse"
import ExamList from "../exam/list"
import { CreateExam } from "../exam/create"
import { EditExam } from "../exam/edit"
import UserList from "../users/list"
import CreateUser from "../users/create"
import EditUser from "../users/edit"
import TagList from "../tag/list"
import { ExamResult } from "../exam/result"
import ChapterList from "../chapter/ChapterList/ChapterList"
import CreateChapter from "../chapter/ChapterCreate/CreateChapter"
import UpdateChapter from "../chapter/ChapterUpdate/UpdateChapter"
import LessonList from "../lesson/LessonList/LessonList"
import CreateLesson from "../lesson/LessonCreate"
import UpdateLesson from "../lesson/LessonUpdate"


export default function Dashboard() {
  const location = useLocation()
  const navigate = useNavigate()

  const [activeState, setActiveState] = useState("")
  const [headerData, setHeaderData] = useState([])

  const [currentTitleProblem, setCurrentTitleProblem] = useState("")
  const [currentTitleCourse, setCurrentTitleCourse] = useState("")
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

  return (
    <SidebarProvider>
      <AppSidebar onNavigate={handleNavigation} />
      <SidebarInset>
        <Header headerData={headerData || []} onNavigate={handleNavigation} />
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
