"use client"

import "react"
import {
  AppWindow,
  AudioWaveform,
  BookText,
  Command,
  FileClock,
  FileLock,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings,
  SquareTerminal,
  User2
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { LOGO } from "@/lib/constants"
import { useAuth } from "@/provider/AuthProvider"
import { useEffect, useState } from "react"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg"
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise"
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup"
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free"
    }
  ],
  navMain: [],
  navAdmin: [
    {
      title: "User Managerment",
      url: "#",
      icon: User2,
      isActive: true,
      items: [
        {
          title: "User",
          url: "/user"
        },
        {
          title: "Create User Account",
          url: "/user/create"
        }
      ]
    },
    {
      title: "System Settings",
      url: "#",
      icon: Settings,
      isActive: true,
      items: [
        {
          title: "Tag",
          url: "/tag"
        }
      ]
    }
  ],
  navTeacher: [
    {
      title: "Problem Management",
      url: "#",
      icon: AppWindow,
      isActive: true,
      items: [
        {
          title: "Problem",
          url: "/problem"
        },
        {
          title: "Create Problem",
          url: "/problem/create"
        }
      ]
    },
    {
      title: "Course Management",
      url: "#",
      icon: BookText,
      isActive: true,
      items: [
        {
          title: "Courses",
          url: "/course"
        },
        {
          title: "Chapter",
          url: "/chapter"
        },
        {
          title: "Lesson",
          url: "/lesson"
        }
      ]
    }
  ],
  navExaminer: [
    {
      title: "Exam Management",
      url: "#",
      icon: FileClock,
      isActive: true,
      items: [
        {
          title: "Examinations",
          url: "/exam"
        },
        {
          title: "Create Examination",
          url: "/exam/create"
        }
      ]
    }
  ],
  projects: [
    {
      name: "My Courses",
      url: "#",
      icon: Frame
    },
    {
      name: "My Problems",
      url: "#",
      icon: PieChart
    },
    {
      name: "My Examinations",
      url: "#",
      icon: Map
    }
  ]
}

const UserRole = {
  STUDENT: "STUDENT",
  TEACHER: "TEACHER",
  EXAMINER: "EXAMINER",
  ADMIN: "ADMIN"
}


export function AppSidebar({ onNavigate }) {

  const { isAuthenticated, user } = useAuth()

  const [currentNav, setCurrentNav] = useState([])

  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
      case UserRole.TEACHER:
        setCurrentNav(data.navTeacher)
        break
      case UserRole.EXAMINER:
        setCurrentNav(data.navExaminer)
        break
      case UserRole.ADMIN:
        setCurrentNav(data.navAdmin)
        break
      default:
        setCurrentNav(data.navMain)
      }
    } else {
      setCurrentNav(data.navMain)
    }
  }, [isAuthenticated, user])


  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div>
          <SidebarMenuButton
            size="lg"
            onClick={() => onNavigate("/")}
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <LOGO className="size-8" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                Kodeholik
              </span>
              <span className="truncate text-xs">Manager platform</span>
            </div>
          </SidebarMenuButton>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={currentNav} onNavigate={onNavigate} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
