import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { createCallAttemptSchema } from "@/services/activity/schema";
import { ActivityService } from "@/services/activity";


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const profile = await authenticateUser();
    const body = await request.json();

    // Validate with createCallAttemptSchema
    const validate = createCallAttemptSchema.parse(body);
    // Build content string: "ANSWERED — Notes go here" or just "ANSWERED"
    const content = validate.notes
        ? `${validate.outcome} — ${validate.notes}`
        : validate.outcome;
    // Create activity with type CALL_ATTEMPT
    const activity = await ActivityService.create([
        {
        leadId: id,
        actorId: profile.id,
        type: "CALL_ATTEMPT",
        meta: {
            content: content,
        },
        }
    ]); 
    // Return success
    return NextResponse.json({ success: true, data: activity });
  } catch (error) {
    return handleRouteError(error);
  }
}