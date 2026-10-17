import { createSupabaseServerClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import UsersPageClient from "@/components/admin/users-page-client"

export default async function AdminUsersPage() {
  // Check authentication
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/")

  // Fetch the user profile
  const profile = await prisma.profile.findUnique({
    where: {
      id: user.id
    }
  })

  if (!profile || !profile.isActive) {
    await supabase.auth.signOut()
    redirect("/")
  }

  if (profile.role !== "ADMIN") redirect("/dashboard")

  return (
    <UsersPageClient />
  )
}