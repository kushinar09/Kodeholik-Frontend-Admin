"use client"

import "react"
import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  SquareTerminal
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

// This is sample data.
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
  navMain: [
    {
      title: "Management",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Problems",
          url: "/problem"
        },
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
        },
        {
          title: "Examinations",
          url: "/exam"
        },
        {
          title: "User",
          url: "/user"
        },
        {
          title: "Tag",
          url: "/tag"
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

export function AppSidebar({ onNavigate }) {
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
        <NavMain items={data.navMain} onNavigate={onNavigate} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
