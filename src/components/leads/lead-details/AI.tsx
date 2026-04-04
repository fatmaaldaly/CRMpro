import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useGenerateLeadBrief, useGetBrief, useSaveBrief, useGenerateCallFollowup, useSaveFollowup } from "@/lib/tanstack/useAI";
import { AlertTriangle, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";
import { BriefContent } from "./BriefContent";
import FollowupReview from "./FollowupReview";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";


export const AI = ({ leadId }: { leadId: string }) => {
  const [error, setError] = useState<string | null>(null);
  const [isGeneratedBriefOpen, setIsGeneratedBriefOpen] = useState(false);
  const [showFollowup, setShowFollowup] = useState(false);


  // Lead Brief
  const generateBrief = useGenerateLeadBrief(leadId);
  const saveBrief = useSaveBrief(leadId);
  const { data: briefResponse, isPending: isLoadingBrief } = useGetBrief(leadId);
  const brief = briefResponse?.leadBrief?.brief;
  console.log("keyFacts length:", brief?.keyFacts.length); // safe now
  const generatedBrief = generateBrief.data;





  // Call Follow-up
  const generateFollowup = useGenerateCallFollowup(leadId);
  const saveCallFollowup = useSaveFollowup(leadId);
  const callFollowup = generateFollowup.data;
  const isFollowupPending = generateFollowup.isPending;

  // Handlers
  const handleGenerateBrief = () => {
    setError(null);
    generateBrief.mutate(undefined, {
      onError: (err) => setError(err.message),
      onSuccess: () => setIsGeneratedBriefOpen(true),
    });
  };

  const handleSaveBrief = () => {
  if (!generatedBrief) return;

  saveBrief.mutate(generatedBrief, {
    onError: (err) => setError(err.message),
    onSuccess: () => {
      setIsGeneratedBriefOpen(false);

    },
  });
};

console.log("briefResponse:", briefResponse);

  const handleGenerateFollowup = () => {
    setError(null);
    generateFollowup.mutate(
      { callOutcome: "ANSWERED", agentNotes: "Call completed successfully" },
      {
        onSuccess: () => setShowFollowup(true),
        onError: (err) => setError(err.message),
      }
    );
  };

  const handleSaveFollowup = () => {
  if (!callFollowup) return;

  saveCallFollowup.mutate(callFollowup, {
    onError: (err) => setError(err.message),
  });
  };

  if (isLoadingBrief) {
    return (
      <div className="flex items-center gap-2 p-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading Brief...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 p-4">
      {/* Lead Brief Box */}
      <div className="col-span-6 space-y-4 border p-4 rounded-lg">
        {!brief ? (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Lead Brief</h3>
            <p className="text-sm text-muted-foreground">
              No lead brief generated yet. Click the button below to generate one.
            </p>
           
            <Button onClick={handleGenerateBrief} disabled={generateBrief.isPending}>
              <Sparkles className="mr-2" />
              {generateBrief.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Brief...
                </>
              ) : (
                "Generate Lead Brief"
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">AI-Generated Lead Brief</h3>
              <Button variant="outline" size="sm" onClick={handleGenerateBrief} disabled={generateBrief.isPending}>
                <RefreshCw className="mr-2 h-4 w-4" />
                {generateBrief.isPending ? "Generating..." : "Regenerate"}
              </Button>
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                AI suggestions can be wrong. Always verify before taking action.
              </AlertDescription>
            </Alert>
            <BriefContent brief={brief} />
          </>
        )}

        {/* Dialog for previewing generated brief before saving */}
        <Dialog open={isGeneratedBriefOpen} onOpenChange={setIsGeneratedBriefOpen}>
          
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
      <DialogTitle>Generated Lead Brief</DialogTitle>
    </DialogHeader>
            {generatedBrief ? (
              <div className="space-y-4">
                <BriefContent brief={generatedBrief} />
                <DialogFooter>
                  <Button onClick={handleSaveBrief} disabled={saveBrief.isPending}>
                    {saveBrief.isPending ? "Saving..." : "Save Brief"}
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating Brief...</span>
              </div>
            )}
          </DialogContent>
             {/* <DialogHeader>
              <DialogTitle>Generated Lead Brief</DialogTitle>
            </DialogHeader> */}
        </Dialog>
      </div>

      {/* Call Follow-up Box */}
      <div className="col-span-6 space-y-4 border p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Call Follow-up Assistant</h3>
        </div>

        {!showFollowup ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              After logging a call, generate AI suggestions for follow-up.
            </p>
            <Button onClick={handleGenerateFollowup} disabled={isFollowupPending}>
              {isFollowupPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2" />
                  Generate Follow-up
                </>
              )}
            </Button>
          </div>
        ) : callFollowup ? (
          <div className="space-y-4">
            <FollowupReview callFollowUp={callFollowup} />
            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowFollowup(false)} className="flex-1">
                Discard
              </Button>
              <Button className="flex-1" onClick={handleSaveFollowup}>Create Reminder</Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating follow-up...</span>
          </div>
        )}
      </div>

      {/* Global Error */}
      {error && (
        <div className="col-span-12">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

