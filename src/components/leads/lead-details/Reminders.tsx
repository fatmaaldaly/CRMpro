"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useCancelReminder,
  useCompleteReminder,
  useGetLeadReminders,
} from "@/lib/tanstack/useReminders";
import { Pagination } from "@/components/leads/reusable";
import  CreateReminderDialog  from "@/components/reminders/CreateReminderDialog";
import { format } from "date-fns";
import { useState } from "react";


function getReminderDisplayStatus(status: string, dueAt: string | Date) {
  if (status === "COMPLETED") return "completed";
  if (status === "CANCELLED") return "cancelled";
  if (status === "FIRED") return "overdue";
  if (status === "PENDING" && new Date(dueAt) < new Date()) return "overdue";
  return "upcoming";
}

function ReminderStatusBadge({
  status,
  dueAt,
}: {
  status: string;
  dueAt: string | Date;
}) {
  const display = getReminderDisplayStatus(status, dueAt);
  const variantMap: Record<
    string,
    "info" | "warning" | "success" | "outline"
  > = {
    upcoming: "info",
    overdue: "warning",
    completed: "success",
    cancelled: "outline",
  };
  const labelMap: Record<string, string> = {
    upcoming: "Upcoming",
    overdue: "Overdue",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return <Badge variant={variantMap[display]}>{labelMap[display]}</Badge>;
}

export const Reminders = ({ leadId }: { leadId: string }) => {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, isError } = useGetLeadReminders(leadId, {
    page,
    pageSize,
  });

  const reminders = data?.reminders ?? [];
  const total = data?.pagination.total ?? 0;
  const pageCount = data?.pagination.pages ?? 0;
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = total === 0 ? 0 : Math.min(page * pageSize, total);

  const cancelReminder = useCancelReminder();
  const completeReminder = useCompleteReminder();

  if (isLoading) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Loading reminders...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12 text-center text-sm text-destructive">
        Failed to load reminders.
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-end">
        <CreateReminderDialog leadId={leadId} />
      </div>

      {reminders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-8 text-center text-sm text-slate-500">
          No reminders yet. Create one to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder) => {
            const displayStatus = getReminderDisplayStatus(
              reminder.status,
              reminder.dueAt
            );
            const canComplete =
              reminder.status === "PENDING" || reminder.status === "FIRED";
            const canCancel = reminder.status === "PENDING";
            const isOverdue = displayStatus === "overdue";
            const isCompleted = displayStatus === "completed";

            return (
              <div
                key={reminder.id}
                className={`rounded-xl border bg-white p-4 shadow-sm ${
                  isOverdue ? "border-red-200 bg-red-50/50" : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        isCompleted
                          ? "text-slate-400 line-through"
                          : "text-slate-900"
                      }`}
                    >
                      {reminder.title}
                    </p>
                    <p
                      className={`mt-1 text-xs ${
                        isOverdue
                          ? "font-medium text-red-600"
                          : "text-slate-500"
                      }`}
                    >
                      {isCompleted
                        ? `Completed: ${format(new Date(reminder.updatedAt ?? reminder.dueAt), "MMM d, yyyy")}`
                        : `Due: ${format(new Date(reminder.dueAt), "MMM d, yyyy")} at ${format(new Date(reminder.dueAt), "h:mm a")}`}
                      {isOverdue && " (Overdue)"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ReminderStatusBadge
                      status={reminder.status}
                      dueAt={reminder.dueAt}
                    />
                    {canComplete && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs text-green-600 hover:bg-green-50 hover:text-green-700"
                        onClick={() => completeReminder.mutate(reminder.id)}
                        disabled={completeReminder.isPending}
                      >
                        Complete
                      </Button>
                    )}
                    {canCancel && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs text-slate-600"
                        onClick={() => cancelReminder.mutate(reminder.id)}
                        disabled={cancelReminder.isPending}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {total > pageSize && (
            <Pagination
              startItem={startItem}
              endItem={endItem}
              total={total}
              page={page}
              pageCount={pageCount}
              isLoading={isLoading}
              setPage={setPage}
              itemLabel="reminders"
            />
          )}
        </div>
      )}
    </div>
  );
};