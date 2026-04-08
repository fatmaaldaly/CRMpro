"use client"

import {
  User,
  useUpdateUser,
  useDeactivateUser,
  useReactivateUser,
  useResendInvite,
} from "@/lib/tanstack/useUsers";
import { UpdateUserSchema } from "@/services/admin/schema";
import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Mail, MoreHorizontal, UserCog, UserX } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Role } from "@/generated/prisma/enums";



export function UserActions({ user }: { user: User }) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showActivationDialog, setShowActivationDialog] = useState(false);

  const [updateUserForm, setUpdateUserForm] = useState({
    name: user.name,
    role: user.role,
  });

  const updateUser = useUpdateUser(user.id);
  const deactivateUser = useDeactivateUser(user.id);
  const reactivateUser = useReactivateUser(user.id);
  const resendInvite = useResendInvite(user.id);

  function handleUpdateUser() {
    const trimmedName = updateUserForm.name.trim();
    if (!trimmedName) {
      toast.error("Name is required.");
      return;
    }

    const payload: UpdateUserSchema = {};
    if (trimmedName !== user.name) payload.name = trimmedName;
    if (updateUserForm.role !== user.role) payload.role = updateUserForm.role;

    if (Object.keys(payload).length === 0) {
      toast.info("No changes made.");
      return;
    }

    updateUser.mutate(payload, {
      onSuccess: () => {
        toast.success("User updated successfully.");
        setShowEditDialog(false);
      },
      onError: () => {
        toast.error("Failed to update user.");
      },
    });
  }

  function handleDeactivateUser() {
    if (!user.isActive) {
      toast.info("User is already inactive.");
      return;
    }

    deactivateUser.mutate(undefined, {
      onSuccess: () => {
        toast.success("User deactivated successfully.");
        setShowActivationDialog(false);
      },
      onError: () => {
        toast.error("Failed to deactivate user.");
      },
    });
  }

  function handleReactivateUser() {
    if (user.isActive) {
      toast.info("User is already active.");
      return;
    }

    reactivateUser.mutate(undefined, {
      onSuccess: () => {
        toast.success("User reactivated successfully.");
        setShowActivationDialog(false);
      },
      onError: () => {
        toast.error("Failed to reactivate user.");
      },
    });
  }

  function handleResendInvite() {
    resendInvite.mutate(undefined, {
      onSuccess: () => {
        toast.success("Invite resent successfully.");
      },
      onError: () => {
        toast.error("Failed to resend invite.");
      },
    })

  }

  const isActivationPending = deactivateUser.isPending || reactivateUser.isPending;
  const hasEditChanges =
    updateUserForm.name.trim() !== user.name || updateUserForm.role !== user.role;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              setUpdateUserForm({ name: user.name, role: user.role });
              setShowEditDialog(true);
            }}
          >
            <UserCog className="mr-2 h-4 w-4" />
            Edit User
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {!user.lastSignInAt && (
            <>
              <DropdownMenuItem onClick={handleResendInvite}>
                <Mail className="mr-2 h-4 w-4" />
                Resend invite
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
 
          <DropdownMenuSeparator />
          {user.isActive ? (
            <DropdownMenuItem
              onClick={() => setShowActivationDialog(true)}
              className="text-red-600 focus:text-red-600"
            >
              <UserX className="mr-2 h-4 w-4" />
              Deactivate
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setShowActivationDialog(true)}>
              <UserCog className="mr-2 h-4 w-4" />
              Reactivate
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={showEditDialog}
        onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) {
            setUpdateUserForm({ name: user.name, role: user.role });
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>
              Update display name and role for {user.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor={`edit-name-${user.id}`}>Name</Label>
              <Input
                id={`edit-name-${user.id}`}
                value={updateUserForm.name}
                onChange={(e) =>
                  setUpdateUserForm((prev) => ({ ...prev, name: e.target.value }))
                }
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-role-${user.id}`}>Role</Label>
              <Select
                value={updateUserForm.role}
                onValueChange={(value) =>
                  setUpdateUserForm((prev) => ({
                    ...prev,
                    role: value as Role,
                  }))
                }
              >
                <SelectTrigger id={`edit-role-${user.id}`}>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Role.AGENT}>Agent</SelectItem>
                  <SelectItem value={Role.MANAGER}>Manager</SelectItem>
                  <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setUpdateUserForm({ name: user.name, role: user.role });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateUser}
                disabled={
                  !updateUserForm.name.trim() || !hasEditChanges || updateUser.isPending
                }
              >
                {updateUser.isPending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={showActivationDialog}
        onOpenChange={setShowActivationDialog}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {user.isActive ? `Deactivate ${user.name}?` : `Reactivate ${user.name}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {user.isActive
                ? `This will prevent ${user.name} from signing in. Their data and activity history will remain intact. You can reactivate them later.`
                : `Restore access for ${user.name}. They will be able to sign in again.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActivationPending}>
              Cancel
            </AlertDialogCancel>
            {user.isActive ? (
              <AlertDialogAction
                variant="destructive"
                onClick={handleDeactivateUser}
                disabled={isActivationPending}
              >
                {deactivateUser.isPending ? "Deactivating…" : "Deactivate"}
              </AlertDialogAction>
            ) : (
              <AlertDialogAction
                onClick={handleReactivateUser}
                disabled={isActivationPending}
              >
                {reactivateUser.isPending ? "Reactivating…" : "Reactivate"}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}