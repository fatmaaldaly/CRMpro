"use client"

import { useUsers } from "@/lib/tanstack/useUsers"
import { Button } from "../ui/button"
import { useState } from "react"
import UsersTable from "./UsersTable"
import { CreateUserDialog } from "./create-user-dialog"

const UsersPageClient = () => {
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false)
  const { data: users } = useUsers()

  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">Manage your users and their roles.</p>
        </div>
        <Button onClick={() => setIsCreateUserDialogOpen(true)}>+ Create User</Button>
      </div>
      <div>
        <UsersTable users={users ?? []} />
      </div>
      <CreateUserDialog
        open={isCreateUserDialogOpen}
        onOpenChange={setIsCreateUserDialogOpen}
      />
    </div>
  )
}

export default UsersPageClient