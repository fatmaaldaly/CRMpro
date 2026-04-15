import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useGenerateLeadBrief, useGetBrief, useSaveBrief } from "@/lib/tanstack/useAI";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { BriefContent } from "./BriefContent";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles} from "lucide-react";


export const AI = ({ leadId }: { leadId: string }) => {
  const [error, setError] = useState<string | null>(null);
  const [isGeneratedBriefOpen, setIsGeneratedBriefOpen] = useState(false);
  const generateBrief = useGenerateLeadBrief(leadId);
  const saveBrief = useSaveBrief(leadId);
  const { data: briefResponse, isPending: isLoadingBrief } = useGetBrief(leadId);
  const brief = briefResponse?.leadBrief?.brief




  const generatedBrief = generateBrief.data;

  const handleGenerate = () => {
    setError(null)
    generateBrief.mutate(undefined, {
      onError: (error) => {
        setError(error.message);
      },
      onSuccess: () => {
        setIsGeneratedBriefOpen(true);
      }
    })
  }

  const handleSave = () => {
    if (!generatedBrief) return;
    saveBrief.mutate(generatedBrief, {
      onError: (error) => {
        setError(error.message);
      },
      onSuccess: () => {
        setIsGeneratedBriefOpen(false);
      }
    })
  }

  const isPending = generateBrief.isPending;
    
  
  
  if (isLoadingBrief) {
    return (
      <div className="flex items-center gap-2 p-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading Brief...</span>
      </div>
    )
  }

return (
  <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 p-4">

    {/*Lead Brief Card */}
    <div className="border rounded-lg shadow-sm bg-white">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
      <h3 className="flex items-center font-semibold text-lg">
        <Sparkles className="h-5 w-5 mr-1.5" />
        Lead Brief
      </h3>

      {brief && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={isPending}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Regenerate
        </Button>
      )}
    </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {!brief ? (
          <>
            <p className="text-sm text-muted-foreground">
              AI will analyze this lead&apos;s activity history and suggest actions.
            </p>

            <Button onClick={handleGenerate} disabled={generateBrief.isPending}>
              {generateBrief.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Brief...
                </>
              ) : (
                "Generate Lead Brief"
              )}
            </Button>
          </>
        ) : (
          <>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                AI suggestions can be wrong. Always verify before taking action.
              </AlertDescription>
            </Alert>

            <BriefContent brief={brief} />
          </>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>


    <Dialog open={isGeneratedBriefOpen} onOpenChange={setIsGeneratedBriefOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI-Generated Brief</DialogTitle>
        </DialogHeader>

        {generatedBrief ? (
          <div className="space-y-4">
            <BriefContent brief={generatedBrief} />
            <DialogFooter>
              <Button onClick={handleSave} disabled={saveBrief.isPending}>
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
    </Dialog>

  </div>
);
}