
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../ui/breadcrumb"
import { Separator } from "../ui/separator"
import { SidebarTrigger } from "../ui/sidebar"
import Notification from "./notification"

export default function Header({ headerData = [], onNavigate }) {
  const data = Array.isArray(headerData) ? headerData : []

  return (
    <header className="sticky top-0 z-50 bg-white flex h-16 shrink-0 items-center gap-2">
      <div className="w-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {data.map((item, index) => {
                const isLast = index === data.length - 1

                return (
                  <div key={index} className="flex items-center gap-2">
                    {isLast ? (
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbPage className="font-semibold">{item.title}</BreadcrumbPage>
                      </BreadcrumbItem>
                    ) : (
                      <>
                        <BreadcrumbItem className="hidden md:block">
                          <BreadcrumbLink className="cursor-pointer" onClick={() => onNavigate(item.url)}>{item.title}</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block" />
                      </>
                    )}
                  </div>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Notification />
      </div>
    </header>
  )
}
