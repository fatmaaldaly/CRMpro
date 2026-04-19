import { ActivityType } from "@/generated/prisma/enums";
import { ActivitySchema, ActivityService } from "@/services/activity";
import { createNoteSchema } from "@/services/activity/schema";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";

// GET /api/leads/[id]/activities?page=1&pageSize=10
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const profile = await authenticateUser();

    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");

    const validated = ActivitySchema.getByLeadId.parse({
      leadId: id,
      page: page,
      pageSize: pageSize,
    });

    const activities = await ActivityService.getByLeadId(validated, {
      id: profile.id,
      role: profile.role,
    });

    return NextResponse.json({ success: true, data: activities });
  } catch (error) {
    return handleRouteError(error);
  }
}



// in src/app/api/leads/[id]/activities/route.ts

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const profile = await authenticateUser();
    const body = await request.json();

    // Validate: { content: string, min 1 char }
    const validated = createNoteSchema.parse(body); 
    // Create activity with type NOTE
    // Call ActivityService.create
    const activity = await ActivityService.create([
      {
      leadId: id,
      actorId: profile.id,
      type: ActivityType.NOTE,
      content: validated.content,
  
    }
    ]);

    // Return the created activity
    return NextResponse.json({ success: true, data: activity });
  } catch (error) {
    return handleRouteError(error);
  }
}