
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
import { ExamList } from "../exam/list"
import CourseList from "../course/CourseList/ViewListCourse"
import CreateCourse from "../course/CourseCreate/CreateCourse"
import UpdateCourse from "../course/CourseUpdate/UpdateCourse"
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
  const [currentTitleChapter, setCurrentTitleChapter] = useState("")
  const [currentTitleLesson, setCurrentTitleLesson] = useState("")

  useEffect(() => {
    if (location.pathname === "/problem") {
      setActiveState("problemList")
    } else if (location.pathname === "/problem/create") {
      setActiveState("problemCreate")
    } else if (/^\/problem\/[\w-]+$/.test(location.pathname)) {
      setActiveState("problemEdit")
      // TODO: get title base slug
      // example
      // setCurrentTitleProblem("Edit Problem")
    } else if (location.pathname === "/exam") {
      setActiveState("examList")
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
      setCurrentTitleCourse("Chương 1: Giới thiệu khóa học")
    } else if (location.pathname === "/lesson") {
      setActiveState("lessonList")
    } else if (location.pathname === "/lesson/add") {
      setActiveState("createLesson")
    } else if (/^\/lesson\/[\w-]+$/.test(location.pathname)) {
      setActiveState("updateLesson")
      setCurrentTitleCourse("Introduction to Python")
    } else {
      setActiveState("")
    }
  }, [location.pathname])

  useEffect(() => {
    const pathname = location.pathname
    const headerMap = {
      "/problem": [{ title: "Problem", url: "/" }],
      "/exam": [{ title: "Examination", url: "/" }],
      "/course": [{ title: "Course", url: "/" }],
      "/chapter": [{ title: "Chapter", url: "/"}],
      "/lesson": [{ title: "Lesson", url: "/"}],
      "/course/add": [
        { title: "Course", url: "/course" },
        { title: "Create Course", url: "#" },
      ],
      "/chapter/add": [
        { title: "Chapter", url: "/chapter" },
        { title: "Create Chapter", url: "#" },
      ],
      "/lesson/add": [
        { title: "Lesson", url: "/lesson" },
        { title: "Create Lesson", url: "#" },
      ],
      "/problem/create": [
        { title: "Problem", url: "/problem" },
        { title: "Create Problem", url: "#" },
      ],
    }

    const match = pathname.match(/^\/problem\/[\w-]+$/)
    const courseMatch = pathname.match(/^\/course\/[\w-]+$/)
    const chapterMatch = pathname.match(/^\/chapter\/[\w-]+$/)
    const lessonMatch = pathname.match(/^\/lesson\/[\w-]+$/)

    if (pathname !== "/problem/create" && match) {
      headerMap[pathname] = [
        { title: "Problem", url: "/problem" },
        { title: currentTitleProblem, url: "#" },
      ]
    }

    if (pathname !== "/course/add" && courseMatch) {
      headerMap[pathname] = [
        { title: "Course", url: "/course" },
        { title: currentTitleCourse, url: "#" },
      ]
    }

    if (pathname !== "/chapter/add" && chapterMatch) {
      headerMap[pathname] = [
        { title: "Chapter", url: "/chapter" },
        { title: currentTitleChapter, url: "#" },
      ]
    }

    if (pathname !== "/lesson/add" && lessonMatch) {
      headerMap[pathname] = [
        { title: "Lesson", url: "/lesson" },
        { title: currentTitleLesson, url: "#" },
      ]
    }

    if (pathname.startsWith("/users")) {
      setHeaderData([
        { title: "Users", url: "/users" },
        { title: "Create User", url: "/users/create" },
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
          {activeState === "problemList" && <ProblemList onNavigate={handleNavigation} />}
          {activeState === "problemCreate" && <ProblemCreator onNavigate={handleNavigation} />}
          {activeState === "problemEdit" && <ProblemEdit onNavigate={handleNavigation} setCurrentTitleProblem={setCurrentTitleProblem} />}
          {activeState === "examList" && <ExamList onNavigate={handleNavigation} />}
          {activeState === "courseList" && <CourseList onNavigate={handleNavigation}/>}
          {activeState === "createCourse" && <CreateCourse onNavigate={handleNavigation}/>}
          {activeState === "updateCourse" && <UpdateCourse onNavigate={handleNavigation} setCurrentTitleCourse={setCurrentTitleCourse}/>}
          {activeState === "chapterList" && <ChapterList onNavigate={handleNavigation}/>}
          {activeState === "createChapter" && <CreateChapter onNavigate={handleNavigation}/>}
          {activeState === "updateChapter" && <UpdateChapter onNavigate={handleNavigation} setCurrentTitleChapter={setCurrentTitleChapter}/>}
          {activeState === "lessonList" && <LessonList onNavigate={handleNavigation}/>}
          {activeState === "createLesson" && <CreateLesson onNavigate={handleNavigation}/>}
          {activeState === "updateLesson" && <UpdateLesson onNavigate={handleNavigation} setCurrentTitleLesson={setCurrentTitleLesson} />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
