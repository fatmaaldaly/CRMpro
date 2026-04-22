"use client";

import { FormEvent, useState } from "react";
import { useCreateLeadReminder } from "@/lib/tanstack/useReminders";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";


export default function CreateReminderDialog({ leadId }: { leadId: string }) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [dueTime, setDueTime] = useState("");
    const [error, setError] = useState("");
    const createReminder = useCreateLeadReminder(leadId);


    function resetForm() {
        setTitle("");
        setDueDate("");
        setDueTime("");

    }


    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      setError("");

      if (!dueDate || !dueTime) {
          const msg = "All fileds are required"
          setError(msg);
          return;
      }
  
      try {
        const dueAt = new Date(`${dueDate}T${dueTime}`);
        await createReminder.mutateAsync({ title, dueAt, leadId });
        toast.success("Reminder created successfully");
        
        resetForm();
        setOpen(false);
      } catch (mutationError) {
        const message = getApiErrorMessage(mutationError, "Failed to create reminder");
        setError(message);
      }
    }
    
      
    function handleOpenChange(nextOpen: boolean) {
      setOpen(nextOpen);
      if (!nextOpen) {
        resetForm();
      }
    }
     

  return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button className="h-10 rounded-b-sm px-4 shadow-sm bg-white text-black">
            Create Reminder
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Reminder</DialogTitle>
          </DialogHeader>
  
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={createReminder.isPending}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                disabled={createReminder.isPending}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueTime">Due Time</Label>
              <input
                id="dueTime"
                type="time"
                value={dueTime}
                onChange={(event) => setDueTime(event.target.value)}
                disabled={createReminder.isPending}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
  
            <DialogFooter className="px-0 py-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={createReminder.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createReminder.isPending}>
                {createReminder.isPending ? "Creating..." : "Create Reminder"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
  )

};