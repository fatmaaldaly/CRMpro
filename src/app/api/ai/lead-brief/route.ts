import { AISchema, AIService } from "@/services/ai";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";


// POST /api/ai/lead-brief — route handler that authenticates, validates, fetches lead context, calls the AI service, logs the generation as an activity, and returns a typed brief
export async function POST(req: NextRequest) {
  try {
    // authenticate
    const profile = await authenticateUser();
    const body = await req.json();
    
    // validate
    const { leadId } = AISchema.generateLeadBrief.parse(body);

    // call service
    const brief = await AIService.generateLeadBrief(leadId, {
      id: profile.id,
      role: profile.role,
    });
    
    // response
    return NextResponse.json({ success: true, data: brief });
  } catch (error) {
    console.error("AI ROUTE ERROR:", error); 
    return handleRouteError(error);
  }
}