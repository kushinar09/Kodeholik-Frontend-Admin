
import Header from "@/components/layout/header"
import { AppSidebar } from "@/components/layout/sidebar"
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar"
import { Outlet, useLocation } from "react-router-dom"

export default function Dashboard() {
  const location = useLocation()
  const getHeaderData = () => {
    if (location.pathname === "/problem/create") {
      return [
        { title: "Problem", url: "/" },
        { title: "Create Problem", url: "/problem/create" }
      ]
    } else if (location.pathname.startsWith("/users")) {
      return [
        { title: "Users", url: "/users" },
        { title: "Create User", url: "/users/create" }
      ]
    }
    return [{ title: "Dashboard", url: "/" }]
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header headerData={getHeaderData() || []} />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
