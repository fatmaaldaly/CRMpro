"use client";

import { useGetLeadReminders, useGetMyReminders, useUpdateReminder, useCancelReminder } from "@/lib/tanstack/useReminders";
import { ReminderStatusBadge } from "../reusable";
import { Button } from "../../ui/button";
import { format } from "date-fns";
import CreateReminderDialog from "./CreateReminderDialog";
import type { Reminder } from "@/generated/prisma/client";

type ReminderWithRelations = Reminder & {
  lead: { id: string; name: string };
  assignedTo: { id: string; name: string };
};



interface RemindersProps {
  leadId?: string;
  params: { page: number; pageSize: number; status?: string };
}

export default function Reminders({ leadId, params }: RemindersProps) {
  const leadRemindersQuery = useGetLeadReminders(leadId ?? "", params);
  const myRemindersQuery = useGetMyReminders(params);

  const data = leadId ? leadRemindersQuery.data : myRemindersQuery.data;
  const isLoading = leadId ? leadRemindersQuery.isLoading : myRemindersQuery.isLoading;
  const isError = leadId ? leadRemindersQuery.isError : myRemindersQuery.isError;
  const reminders = data?.reminders ?? [];

  const updateReminder = useUpdateReminder();
  const cancelReminder = useCancelReminder();


  const handleComplete = (id: string) => {
    updateReminder.mutate({ reminderId: id, status: "FIRED" });
  };

  const handleCancel = (id: string) => {
    cancelReminder.mutate(id);
  };


  const isOverdue = (dueAt: string | Date, status: string) =>
    status === "PENDING" && new Date(dueAt) < new Date();

  return (
    
    <div className="space-y-4">
        {/* <div className="">
          <CreateReminderDialog leadId={leadId} params={params} />
        </div> */}
      {/* Header with Create Reminder Button */}
       
      <div className="flex justify-between items-center">
       
        {leadId ? <CreateReminderDialog leadId={leadId} params={params} /> : null}
      </div>

      {isLoading && <div className="text-sm text-gray-500">Loading reminders...</div>}
      {isError && <div className="text-sm text-red-500">Failed to load reminders.</div>}

      {!isLoading && !isError && (
        <div className="space-y-3">
          {reminders.map((reminder: ReminderWithRelations) => {
            const overdue = isOverdue(reminder.dueAt, reminder.status);
            const borderClass = overdue
              ? "border-red-300"
              : reminder.status === "FIRED"
              ? "border-green-200"
              : "border-gray-200";

            return (
              <div
                key={reminder.id}
                className={`flex justify-between items-center p-4 border rounded-md bg-white shadow-sm ${borderClass}`}
              >
                <div className="flex flex-col">
                  <span className={`text-sm ${overdue ? "text-red-600 font-semibold" : "text-gray-800"}`}>
                    {reminder.title}
                  </span>
                  <span className="text-xs text-gray-500">
                    Due: {format(new Date(reminder.dueAt), "MMM dd, yyyy 'at' hh:mm a")}
                    {overdue ? " (Overdue)" : ""}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <ReminderStatusBadge status={overdue ? "PENDING" : reminder.status} />
                  {reminder.status === "PENDING" && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleComplete(reminder.id)}>
                        Complete
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleCancel(reminder.id)}>
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}