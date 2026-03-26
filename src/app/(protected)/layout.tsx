import { AppSidebar } from "@/components/app-sidebar"
import { AppShell } from "@/components/app-shell"
import { SidebarProvider } from "@/components/ui/sidebar"
import { prisma } from "@/lib/prisma"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { QueryProvider } from "@/providers/query-provider"
import { redirect } from "next/navigation"

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // Check authentication
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Fetch the user profile
  const profile = await prisma.profile.findUnique({
    where: {
      id: user.id
    }
  })

  if (!profile || !profile.isActive) {
    await supabase.auth.signOut()
    redirect("/login")
  }

  return (
    <QueryProvider>
      <SidebarProvider>
        <AppSidebar role={profile.role} user={profile} />
        <AppShell role={profile.role} email={profile.email}>
          {children}
        </AppShell>
      </SidebarProvider>
    </QueryProvider>

  )
}
