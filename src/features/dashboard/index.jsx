
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

export default function Dashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeState, setActiveState] = useState("")
  const [currentTitleProblem, setCurrentTitleProblem] = useState("")
  const [currentTitleCourse, setCurrentTitleCourse] = useState("")
  const [currentTitleExam, setCurrentTitleExam] = useState("")
  const [currentTitleUser, setCurrentTitleUser] = useState("")

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
      setCurrentTitleExam("Examination");
    } else if (location.pathname === "/exam/create") {
      setActiveState("examCreate")
      setCurrentTitleExam("Examination");
    } else if (location.pathname.includes("/exam/edit")) {
      setActiveState("examEdit")
      setCurrentTitleExam("Examination");
    }else if (location.pathname === "/user") {
      setActiveState("userList")
      setCurrentTitleUser("Users");
    }else if (location.pathname === "/user/create") {
      setActiveState("userCreate")
      setCurrentTitleUser("Users");
    }else if (location.pathname.includes("/user/edit")) {
      setActiveState("userEdit")
      setCurrentTitleUser("Users");
    }else if (location.pathname === "/course") {
      setActiveState("courseList")
    } else if (location.pathname === "/course/add") {
      setActiveState("createCourse")
    } else if (/^\/course\/[\w-]+$/.test(location.pathname)) {
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
      "/exam/create": [
        { title: "Examination", url: "/exam" },
        { title: "Create Exam", url: "#" }
      ],
      "/exam/edit": [
        { title: "Examination", url: "/exam" },
        { title: "Edit Exam", url: "#" }
      ],
      "/user": [{ title: "Users", url: "/" }],
      "/user/create": [
        { title: "Users", url: "/user" },
        { title: "Create User", url: "#" }
      ],
      "/user/edit": [
        { title: "Users", url: "/user" },
        { title: "Edit User", url: "#" }
      ],
      "/course": [{ title: "Course", url: "/" }],
      "/course/add": [
        { title: "Course", url: "/course" },
        { title: "Create Course", url: "#" }
      ],
      "/problem/create": [
        { title: "Problem", url: "/problem" },
        { title: "Create Problem", url: "#" }
      ]
    }

    const match = location.pathname.match(/^\/problem\/[\w-]+$/)
    const courseMatch = location.pathname.match(/^\/course\/[\w-]+$/)
    const examMatch = location.pathname.match(/^\/exam\/[\w-]+$/)
    const examEditMatch = location.pathname.match(/^\/exam\/[^/]+\/[^/]+$/)
    const userEditMatch = location.pathname.match(/^\/user\/[^/]+\/[^/]+$/)
    const userMatch = location.pathname.match(/^\/user\/[\w-]+$/)

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

    if (location.pathname !== "/exam/create" && examMatch) {
      headerMap[location.pathname] = [
        { title: "Examination", url: "/exam" },
        { title: currentTitleExam, url: "#" }
      ]
    }

    if (location.pathname !== "/exam/edit" && examMatch) {
      headerMap[location.pathname] = [
        { title: "Examination", url: "/exam" },
        { title: currentTitleExam, url: "#" }
      ]
    }

    if(examEditMatch) {
      headerMap[location.pathname] = [
        { title: "Examination", url: "/exam" },
        { title: "Edit Exam", url: "#" }
      ]
    }

    if(userEditMatch) {
      headerMap[location.pathname] = [
        { title: "Users", url: "/user" },
        { title: "Edit User", url: "#" }
      ]
    }

    if (location.pathname !== "/user/create" && userMatch) {
      headerMap[location.pathname] =  [
        { title: "Users", url: "/user" },
        { title: "Create User", url: "/user/create" }
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
          {activeState === "userList" && <UserList onNavigate={handleNavigation} />}
          {activeState === "userCreate" && <CreateUser onNavigate={handleNavigation} />}
          {activeState === "userEdit" && <EditUser onNavigate={handleNavigation} />}
          {activeState === "examList" && <ExamList onNavigate={handleNavigation} />}
          {activeState === "examCreate" && <CreateExam onNavigate={handleNavigation} />}
          {activeState === "examEdit" && <EditExam onNavigate={handleNavigation} />}
          {activeState === "courseList" && <CourseList onNavigate={handleNavigation} />}
          {activeState === "createCourse" && <CreateCourse onNavigate={handleNavigation} />}
          {activeState === "updateCourse" && <UpdateCourse onNavigate={handleNavigation} />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
