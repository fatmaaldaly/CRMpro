import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CallFollowUp } from "@/services/ai/schema";


export default function FollowupReview({ callFollowUp }: { callFollowUp: CallFollowUp }) {
  if (!callFollowUp) {
    return <div>No follow-up data available</div>;
  }

  // const callScript = callFollowUp.callScript ?? {
  //   opening: "",
  //   questions: [],
  //   objectionHandlers: [],
  // };
  // const suggestedReminder = callFollowUp.suggestedReminder ?? {
  //   title: "",
  //   note: "",
  //   suggestedDueAt: "",
  // };
    
    
return (

    <div className="space-y-4">
      
      {/* Call Script */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Call Script</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium">Opening:</h4>
            <p className="text-sm text-muted-foreground">{callFollowUp.callScript.opening || "No opening suggested"}</p>
          </div>
          
          <div>
            <h4 className="font-medium">Questions:</h4>
            {callFollowUp.callScript.questions.length > 0 ? (
              <ul className="list-disc list-inside text-sm">
                {callFollowUp.callScript.questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No questions suggested</p>
            )}
          </div>
          
         <div>
            <h4 className="font-medium">Objection Handlers:</h4>
            {callFollowUp.callScript.objectionHandlers.length > 0 ? (
              callFollowUp.callScript.objectionHandlers.map((oh, i) => (
                <div key={i} className="text-sm">
                  <strong>{oh.objection}:</strong> {oh.response}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No objection handlers suggested</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommended Next Step */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recommended Next Step</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{callFollowUp.recommendedNextStep || "No next step suggested"}</p>
        </CardContent>
      </Card>

      {/* Suggested Reminder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Suggested Reminder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm font-medium">{callFollowUp.suggestedReminder.title || "No title"}</p>
          <p className="text-sm text-muted-foreground">{callFollowUp.suggestedReminder.note || "No note"}</p>
          <p className="text-sm">
            Due: {callFollowUp.suggestedReminder.suggestedDueAt ? new Date(callFollowUp.suggestedReminder.suggestedDueAt).toLocaleString() : "No date"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}