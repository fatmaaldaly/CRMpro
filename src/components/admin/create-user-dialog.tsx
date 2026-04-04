"use client";

import { useCreateUser } from "@/lib/tanstack/useUsers";
import { Role } from "@/generated/prisma/enums";
import { useState } from "react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const initialForm: { email: string; name: string; role: Role } = {
  email: "",
  name: "",
  role: Role.AGENT,
};

type CreateUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const [form, setForm] = useState(initialForm);
  const createUser = useCreateUser();

  function handleOpenChange(next: boolean) {
    if (!next) {
      setForm(initialForm);
    }
    onOpenChange(next);
  }

  function handleSubmit() {
    const email = form.email.trim();
    const name = form.name.trim();
    if (!email || !name) {
      toast.error("Email and name are required.");
      return;
    }

    createUser.mutate(
      { email, name, role: form.role },
      {
        onSuccess: () => {
          toast.success("User created. They will receive an invitation email.");
          handleOpenChange(false);
        },
        onError: (err) => {
          const data = isAxiosError(err) ? err.response?.data : undefined;
          const msg =
            data &&
              typeof data === "object" &&
              "error" in data &&
              typeof (data as { error: unknown }).error === "string"
              ? (data as { error: string }).error
              : null;
          toast.error(msg ?? "Failed to create user.");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create user</DialogTitle>
          <DialogDescription>
            Add a teammate by email. They will get an invitation to set their password
            and sign in.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="create-user-email">Email</Label>
            <Input
              id="create-user-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="name@company.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-user-name">Name</Label>
            <Input
              id="create-user-name"
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-user-role">Role</Label>
            <Select
              value={form.role}
              onValueChange={(value) =>
                setForm((f) => ({ ...f, role: value as Role }))
              }
            >
              <SelectTrigger id="create-user-role">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Role.AGENT}>Agent</SelectItem>
                <SelectItem value={Role.MANAGER}>Manager</SelectItem>
                <SelectItem value={Role.ADMIN}>Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !form.email.trim() || !form.name.trim() || createUser.isPending
              }
            >
              {createUser.isPending ? "Creating…" : "Create user"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}