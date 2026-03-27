"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { useCreateNote } from "@/lib/tanstack/useActivities";



function getTextAreaClassName() {
  return "min-h-28 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50";
}


export function AddNoteDialog({ leadId }: { leadId: string }) {
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState("");
    const [error, setError] = useState("");

    const createNote = useCreateNote(leadId); 

    function resetForm() {
        setContent("");
        setError("");
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await createNote.mutateAsync(content);

      resetForm();
      setOpen(false);
    } catch (mutationError) {
      setError(getApiErrorMessage(mutationError, "Failed to create content"));
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
              
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Note</DialogTitle>
            </DialogHeader>
    
            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              <div className="space-y-2">
                <Label htmlFor="content">Note Content</Label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Enter your note here..."
                  disabled={createNote.isPending}
                  className={getTextAreaClassName()}
                />
              </div>
    
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
    
              <DialogFooter className="px-0 py-0 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={createNote.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createNote.isPending}>
                  {createNote.isPending ? "Adding..." : "Save Note"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
  )


}