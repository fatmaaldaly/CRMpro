"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Role } from "@/generated/prisma/enums";
import { useReassignLeads } from "@/lib/tanstack/useLeads";
import { useUsers } from "@/lib/tanstack/useUsers";

type ReassignLeadsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLeadIds: string[];
  onSuccess: () => void;
};

export function ReassignLeadsDialog({
  open,
  onOpenChange,
  selectedLeadIds,
  onSuccess,
}: ReassignLeadsDialogProps) {
  const [assignToId, setAssignToId] = useState<string>("");
  const usersQuery = useUsers({ page: 1, pageSize: 100 });
  const reassignMutation = useReassignLeads();

  const agents =
    usersQuery.data?.users.filter(
      (user) => user.role === Role.AGENT && user.isActive,
    ) ?? [];

  const handleSubmit = () => {
    if (!assignToId) {
      toast.error("Pick an agent to reassign to.");
      return;
    }

    reassignMutation.mutate(
      { leadIds: selectedLeadIds, assignToId },
      {
        onSuccess: (result) => {
          const targetName =
            agents.find((a) => a.id === assignToId)?.name ?? "selected agent";
          toast.success(
            `Reassigned ${result.count} ${result.count === 1 ? "lead" : "leads"} to ${targetName}.`,
          );
          setAssignToId("");
          onOpenChange(false);
          onSuccess();
        },
        onError: (error) => {
          toast.error(error.message || "Failed to reassign leads.");
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setAssignToId("");
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Reassign leads</DialogTitle>
          <DialogDescription>
            Move {selectedLeadIds.length}{" "}
            {selectedLeadIds.length === 1 ? "lead" : "leads"} to a different
            agent. Each lead will get an assignment-change activity.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
         >
          <div className="space-y-2">
            <Label htmlFor="reassign-agent">Assign to</Label>
            <Select
              value={assignToId}
              onValueChange={setAssignToId}
              disabled={usersQuery.isLoading || reassignMutation.isPending}
            >
              <SelectTrigger id="reassign-agent">
                <SelectValue
                  placeholder={
                    usersQuery.isLoading ? "Loading agents..." : "Select an agent"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {agents.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No active agents available.
                  </div>
                ) : (
                  agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name} ({agent.email})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={reassignMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!assignToId || reassignMutation.isPending}
            >
              {reassignMutation.isPending ? "Reassigning..." : "Reassign"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
