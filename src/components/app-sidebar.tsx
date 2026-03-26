"use client"

import { Profile, Role } from "@/generated/prisma/client"
import { Calendar, LayoutDashboard, User, Users } from "lucide-react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar"
import { Separator } from "./ui/separator"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { NavUser } from "./app-sidebar-footer"
import { formatRoleLabel } from "./app-shell-config"

const mainSidebarItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: Users },
  { label: "Reminders", href: "/reminders", icon: Calendar }
]

const adminSidebarItems = [
  { label: "Users", href: "/users", icon: User },
]

export function AppSidebar({ role, user }: { role: Role, user: Profile }) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    return pathname === href
  }

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="gap-3 px-5 py-6">
        <div className="space-y-1">
          <h4 className="text-[1.75rem] font-bold tracking-tight text-slate-900">
            CRM Pro
          </h4>
          <p className="text-xs font-semibold tracking-[0.18em] text-blue-600 uppercase">
            {formatRoleLabel(role)}
          </p>
        </div>
      </SidebarHeader>

      <Separator className="bg-sidebar-border" />


      <SidebarContent className="px-3 py-4">
        {/* Main sidebar items for all users */}
        <SidebarGroup className="px-0 py-0">
          <SidebarGroupLabel className="h-auto px-3 pb-2 text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {mainSidebarItems.map((item) => {
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      className="h-11 rounded-xl px-3 text-[0.95rem] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 data-[active=true]:shadow-[inset_0_0_0_1px_rgba(59,130,246,0.16)] data-[active=true]:[&_svg]:text-blue-600 [&_svg]:size-4 [&_svg]:text-slate-400"
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin sidebar items */}
        {role === "ADMIN" && (
          <SidebarGroup className="mt-6 px-0 py-0">
            <SidebarGroupLabel className="h-auto px-3 pb-2 text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                {adminSidebarItems.map(item => {
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href)}
                        className="h-11 rounded-xl px-3 text-[0.95rem] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 data-[active=true]:shadow-[inset_0_0_0_1px_rgba(59,130,246,0.16)] data-[active=true]:[&_svg]:text-blue-600 [&_svg]:size-4 [&_svg]:text-slate-400"
                      >
                        <Link href={item.href}>
                          <item.icon className="size-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>


      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border px-4 py-4">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
