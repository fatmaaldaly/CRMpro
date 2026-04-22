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
import { useLogCallAttempt } from "@/lib/tanstack/useActivities";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGenerateCallFollowup, useSaveCallFollowUp } from "@/lib/tanstack/useAI";
import { useCreateLeadReminder } from "@/lib/tanstack/useReminders";
import type { CallFollowUp } from "@/services/ai/schema";
import { Sparkles } from 'lucide-react';
import FollowupReview from "./FollowupReview";
import { toast } from "sonner";


function getTextAreaClassName() {
  return "min-h-28 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50";
}


export default function LogCallDialog({ leadId }: { leadId: string }) {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");
    const [outcome, setOutcome] = useState("");
    const [duration, setDuration] = useState("");
    const [note, setNote] = useState("");
    const [step, setStep] = useState<"log" | "suggest" | "review">("log");
    const [callFollowUp, setCallFollowUp] = useState<CallFollowUp | null>(null);

    const logCallAttempt = useLogCallAttempt(leadId);
    const generateCallFollowup = useGenerateCallFollowup(leadId);
    const createReminder = useCreateLeadReminder(leadId);
    const saveCallFollowUp = useSaveCallFollowUp(leadId);


  function resetForm() {
        setOutcome("");
        setDuration("");
        setNote("");
        setError("");
        setStep("log");
        setCallFollowUp(null);
    }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await logCallAttempt.mutateAsync({
         outcome: outcome as "NO_ANSWER" | "ANSWERED" | "WRONG_NUMBER" | "BUSY" | "CALL_BACK_LATER",
         notes: note || undefined,
        });
        toast.success("Call logged successfully");
        setStep("suggest");

        } catch (mutationError) {
            setError(getApiErrorMessage(mutationError, "Failed to log call attempt"));
        }
    }


      function handleOpenChange(nextOpen: boolean) {
      setOpen(nextOpen);

      if (!nextOpen) {
        resetForm();
      }
     }


    async function handleGenerateSuggestion() {
      setError("");
      try {
        const result = await generateCallFollowup.mutateAsync({
          callOutcome: outcome,
          agentNotes: note || undefined,
        });
        toast.success("AI suggestion generated");
        setCallFollowUp(result);
        setStep("review");
      } catch (mutationError) {
        setError(getApiErrorMessage(mutationError, "Failed to generate suggestion"));
      }
    }


    function handleCreateReminder() {
      const followup = callFollowUp;
      if (!followup) return;

      setError("");

      // save to db
      saveCallFollowUp.mutate(followup, {
        onSuccess: () => {
          // then create reminder
          createReminder.mutate({
            leadId,
            title: followup.suggestedReminder.title,
            note: followup.suggestedReminder.note,
            dueAt: new Date(followup.suggestedReminder.suggestedDueAt),
          },
          
          {
            onSuccess: () => {
              toast.success("Reminder created successfully");
              handleOpenChange(false);
            },
          },);
          
        },
        onError: (err) => {
          setError(getApiErrorMessage(err, "Failed to save follow-up"));
        },
      });
    }


    function handleDiscard() {
      setOpen(false);
      resetForm();
    }



  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-10 rounded-b-sm px-4 shadow-sm">
          Log Call
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-lg p-0 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "log" && "Log Call"}
            {step === "suggest" && "Call Logged"}
            {step === "review" && "AI Follow-up Suggestion"}
          </DialogTitle>
        </DialogHeader>

        {step === "log" && (
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="outcome">Outcome</Label>
              <Select
                  value={outcome}
                  onValueChange={(value) => setOutcome(value)}
                  disabled={logCallAttempt.isPending}
                  required
              >
              <SelectTrigger id="outcome" className="w-full">
                  <SelectValue placeholder="Answered" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="ANSWERED">Answered</SelectItem>
                  <SelectItem value="NO_ANSWER">No Answer</SelectItem>
                  <SelectItem value="WRONG_NUMBER">Wrong Number</SelectItem>
                  <SelectItem value="BUSY">Busy</SelectItem>
                  <SelectItem value="CALL_BACK_LATER">Call Back Later</SelectItem>
              </SelectContent>
              </Select>
              </div>
    

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <input
                id="duration"
                type="number"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                disabled={logCallAttempt.isPending}
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Enter your note here..."
                disabled={logCallAttempt.isPending}
                className={getTextAreaClassName()}
              />
            </div>


            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <DialogFooter className="px-0 py-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={logCallAttempt.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={logCallAttempt.isPending}>
                {logCallAttempt.isPending ? "Creating..." : "Save call"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === "suggest" && (
          <div className="space-y-4 px-6 py-5">
            <p>Want AI to suggest a follow-up?</p>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <DialogFooter className="px-0 py-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleDiscard}
                disabled={generateCallFollowup.isPending}
              >
                Skip
              </Button>
              <Button
                onClick={handleGenerateSuggestion}
                disabled={generateCallFollowup.isPending}
              >
                <Sparkles className="h-5 w-5 text-white-500" />
                {generateCallFollowup.isPending ? "Generating..." : "Get AI Suggestion"}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "review" && callFollowUp && (
          <div className="space-y-4 px-6 py-5">
            <FollowupReview callFollowUp={callFollowUp} />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <DialogFooter className="px-0 py-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleDiscard}
                disabled={createReminder.isPending}
              >
                Discard
              </Button>
              <Button
                onClick={handleCreateReminder}
                disabled={createReminder.isPending}
              >
                {createReminder.isPending ? "Creating..." : "Create Reminder"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
    
        
}