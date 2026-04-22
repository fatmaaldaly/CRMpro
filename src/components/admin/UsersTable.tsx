"use client"

import {useUsers } from "@/lib/tanstack/useUsers"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Badge } from "../ui/badge"
import { UserActions } from "./UserActions"
import { Pagination } from "../leads/reusable";
import { useState } from "react";

// Color mapping for role badges.
// These use Tailwind's default color palette.
const roleBadgeVariant: Record<string, "default" | "info" | "outline"> = {
  ADMIN: "default",
  MANAGER: "info",
  AGENT: "outline",
};


const UsersTable = () => {
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const { data, isLoading, isError } = useUsers({ page, pageSize });
    const usersList = data?.users ?? [];
    const pagination = data?.pagination;
    const startItem = pagination && pagination.total > 0? (pagination.page - 1) * pagination.pageSize + 1: 0;
    const endItem = pagination && pagination.total > 0? Math.min(pagination.page * pagination.pageSize, pagination.total): 0;
    const total = pagination?.total ?? 0;
    const pageCount = pagination?.pages ?? 1;
    const label = "Users";


  if (isLoading) {
  return <div className="p-4 text-sm text-muted-foreground">Loading users...</div>;
  }

  if (isError) {
    return <div className="p-4 text-sm text-red-500">Failed to load users</div>;
  }
  
  if (usersList.length === 0) {
    return <div className="rounded-md border p-8 text-center text-muted-foreground">
      No users yet. Create one to get started.
    </div>
  }
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usersList.map(user => {
            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell>
                  <Badge variant={roleBadgeVariant[user.role] ?? "outline"}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.isActive ? (
                    <Badge
                      variant="outline"
                      className="border-green-200 text-green-700 bg-green-50"
                    >
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-red-200 text-red-700 bg-red-50"
                    >
                      Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <UserActions user={user} />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
     <Pagination startItem={startItem} endItem={endItem} total={total} page={page} pageCount={pageCount} isLoading={isLoading} setPage={setPage} itemLabel={label} />
      
    </div>
  )
}

export default UsersTable