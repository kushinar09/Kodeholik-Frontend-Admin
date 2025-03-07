
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

export default function Dashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeState, setActiveState] = useState("")
  const [currentTitleProblem, setCurrentTitleProblem] = useState("")
  const [currentTitleCourse, setCurrentTitleCourse] = useState("")

  useEffect(() => {
    if (location.pathname === "/problem") {
      setActiveState("problemList")
    } else if (location.pathname === "/problem/create") {
      setActiveState("problemCreate")
    } else if (/^\/problem\/[\w-]+$/.test(location.pathname)) {
      setActiveState("problemEdit")
      // TODO: get title base slug
      // example
      setCurrentTitleProblem("Two Sum")
    } else if (location.pathname === "/exam") {
      setActiveState("examList")
    }else if (location.pathname === "/course"){
      setActiveState("courseList")
    }else if (location.pathname === "/course/add"){
      setActiveState("createCourse")
    }else if (/^\/course\/[\w-]+$/.test(location.pathname)){
      setActiveState("updateCourse")
      setCurrentTitleCourse("Java Beginner")
    } else {
      setActiveState("")
    }
  }, [location.pathname])

  const getHeaderData = () => {
    const headerMap = {
      "/problem": [{ title: "Problem", url: "/" }],
      "/exam": [{ title: "Examination", url: "/" }],
      "/course": [{title: "Course", url: "/"}],
      "/course/add": [
        {title: "Course", url: "/course"},
        {title: "Create Course", url: "#"}
      ],
      "/problem/create": [
        { title: "Problem", url: "/problem" },
        { title: "Create Problem", url: "#" }
      ]
    }

    const match = location.pathname.match(/^\/problem\/[\w-]+$/)
    const courseMatch = location.pathname.match(/^\/course\/[\w-]+$/)

    if (location.pathname !== "/problem/create" && match) {
      headerMap[location.pathname] = [
        { title: "Problem", url: "/problem" },
        { title: currentTitleProblem, url: "#" }
      ]
    }

    if (location.pathname !== "/course/add" && courseMatch) {
      headerMap[location.pathname] = [
        { title: "Course", url: "/course" },
        { title: currentTitleCourse, url: "#" }
      ]
    }

    if (location.pathname.startsWith("/users")) {
      return [
        { title: "Users", url: "/users" },
        { title: "Create User", url: "/users/create" }
      ]
    }

    return headerMap[location.pathname] || [{ title: "Dashboard", url: "/" }]
  }


  const handleNavigation = (path) => {
    navigate(path)
  }

  return (
    <SidebarProvider>
      <AppSidebar onNavigate={handleNavigation} />
      <SidebarInset>
        <Header headerData={getHeaderData() || []} onNavigate={handleNavigation} />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {activeState === "" && <Overview onNavigate={handleNavigation} />}
          {activeState === "problemList" && <ProblemList onNavigate={handleNavigation} />}
          {activeState === "problemCreate" && <ProblemCreator />}
          {activeState === "problemEdit" && <ProblemEdit onNavigate={handleNavigation} />}
          {activeState === "examList" && <ExamList onNavigate={handleNavigation} />}
          {activeState === "courseList" && <CourseList onNavigate={handleNavigation} />}
          {activeState === "createCourse" && <CreateCourse onNavigate={handleNavigation} />}
          {activeState === "updateCourse" && <UpdateCourse onNavigate={handleNavigation} />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
