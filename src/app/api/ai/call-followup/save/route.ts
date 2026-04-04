import { AISchema, AIService } from "@/services/ai";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const profile = await authenticateUser();
    const body = await req.json();

    const data = AISchema.saveCallFollowup.parse(body);

    const result = await AIService.saveCallFollowup(data, profile);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleRouteError(error);
  }
}