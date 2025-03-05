
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

export default function Dashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeState, setActiveState] = useState("")
  const [currentTitleProblem, setCurrentTitleProblem] = useState("")

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
    } else {
      setActiveState("")
    }
  }, [location.pathname])

  const getHeaderData = () => {
    const headerMap = {
      "/problem": [{ title: "Problem", url: "/" }],
      "/exam": [{ title: "Examination", url: "/" }],
      "/problem/create": [
        { title: "Problem", url: "/problem" },
        { title: "Create Problem", url: "#" }
      ]
    }

    const match = location.pathname.match(/^\/problem\/[\w-]+$/)
    if (location.pathname !== "/problem/create" && match) {
      headerMap[location.pathname] = [
        { title: "Problem", url: "/problem" },
        { title: currentTitleProblem, url: "#" }
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
