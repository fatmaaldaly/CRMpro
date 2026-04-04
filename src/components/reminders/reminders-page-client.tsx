"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCancelReminder,
  useCompleteReminder,
  useGetMyReminders,
} from "@/lib/tanstack/useReminders";
import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { Pagination } from "@/components/leads/reusable";

type FilterTab = "all" | "upcoming" | "overdue" | "completed" | "cancelled";

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

function getApiStatusForTab(tab: FilterTab): string | undefined {
  switch (tab) {
    case "completed":
      return "COMPLETED";
    case "cancelled":
      return "CANCELLED";
    default:
      return undefined;
  }
}

export function RemindersPageClient() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const apiStatus = getApiStatusForTab(activeTab);
  const { data, isLoading, isError } = useGetMyReminders({
    page,
    pageSize,
    status: apiStatus,
  });

  const allReminders = data?.reminders ?? [];

  // Client-side filter for upcoming/overdue (both are PENDING in the DB, plus FIRED for overdue)
  const reminders = allReminders.filter((r) => {
    if (activeTab === "upcoming") {
      return r.status === "PENDING" && new Date(r.dueAt) >= new Date();
    }
    if (activeTab === "overdue") {
      return (
        (r.status === "PENDING" && new Date(r.dueAt) < new Date()) ||
        r.status === "FIRED"
      );
    }
    return true;
  });

  const cancelReminder = useCancelReminder();
  const completeReminder = useCompleteReminder();

  const total = data?.pagination.total ?? 0;
  const pageCount = data?.pagination.pages ?? 0;
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = total === 0 ? 0 : Math.min(page * pageSize, total);

  
  const overdueCount = allReminders.filter(
    (r) =>
      (r.status === "PENDING" && new Date(r.dueAt) < new Date()) ||
      r.status === "FIRED"
  ).length;

  function handleTabChange(tab: string) {
    setActiveTab(tab as FilterTab);
    setPage(1);
  }

  return (
    <div className="space-y-6 p-4 md:p-6">

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="overdue" className="gap-1.5">
            Overdue
            {overdueCount > 0 && (
              <Badge
                variant="warning"
                className="ml-1 h-5 min-w-5 rounded-full px-1.5 text-[10px]"
              >
                {overdueCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-slate-500">
          Loading reminders...
        </div>
      ) : isError ? (
        <div className="py-12 text-center text-sm text-destructive">
          Failed to load reminders.
        </div>
      ) : reminders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-8 text-center text-sm text-slate-500">
          No reminders found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70">
                <TableHead className="w-160px">Due Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead className="w-120px">Status</TableHead>
                <TableHead className="w-200px text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reminders.map((reminder) => {
                const displayStatus = getReminderDisplayStatus(
                  reminder.status,
                  reminder.dueAt
                );
                const canComplete =
                  reminder.status === "PENDING" || reminder.status === "FIRED";
                const canCancel = reminder.status === "PENDING";
                const isOverdue = displayStatus === "overdue";

                return (
                  <TableRow
                    key={reminder.id}
                    className={isOverdue ? "bg-red-50/50" : ""}
                  >
                    <TableCell
                      className={`text-sm ${isOverdue ? "font-medium text-red-600" : "text-slate-700"}`}
                    >
                      {format(new Date(reminder.dueAt), "MMM d, h:mm a")}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-slate-900">
                      {reminder.title}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/leads/${reminder.lead.id}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {reminder.lead.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <ReminderStatusBadge
                        status={reminder.status}
                        dueAt={reminder.dueAt}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canComplete && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs text-green-600 hover:bg-green-50 hover:text-green-700"
                            onClick={() =>
                              completeReminder.mutate(reminder.id)
                            }
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
                            onClick={() =>
                              cancelReminder.mutate(reminder.id)
                            }
                            disabled={cancelReminder.isPending}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

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
}




