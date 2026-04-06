import { AISchema, AIService } from "@/services/ai";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const profile = await authenticateUser();
    const body = await req.json();

    const data = AISchema.saveCallFollowUp.parse(body);

    const callFollowup = await AIService.saveCallFollowUp(data, profile);

    return NextResponse.json({ success: true, data: callFollowup });
  } catch (error) {
    return handleRouteError(error);
  }
}