"use client"

import { Button } from "../ui/button"
import { useState } from "react"
import UsersTable from "./UsersTable"
import { CreateUserDialog } from "./create-user-dialog"


const UsersPageClient = () => {
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false)

  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">Manage your users and their roles.</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setIsCreateUserDialogOpen(true)}>
            + Create User
          </Button>
        </div>
        
      </div>
      <div>
        <UsersTable />
      </div>
      <CreateUserDialog
        open={isCreateUserDialogOpen}
        onOpenChange={setIsCreateUserDialogOpen}
      />
    </div>
  )
}

export default UsersPageClient