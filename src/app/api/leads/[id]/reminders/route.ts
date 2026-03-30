import { leadIdParamsSchema } from "@/services/lead/schema";
import { ReminderSchema, ReminderService } from "@/services/reminder";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";

// GET /api/leads/:id/reminders
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await authenticateUser();
    const { id } = leadIdParamsSchema.parse(await params);

    const searchParams = request.nextUrl.searchParams;
    const validated = ReminderSchema.listByLead.parse({
      leadId: id,
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      status: searchParams.get("status") || undefined,
    });

    const result = await ReminderService.listByLead(validated, {
      id: profile.id,
      role: profile.role,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleRouteError(error);
  }
}

// POST /api/leads/:id/reminders
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await authenticateUser();
    const { id } = leadIdParamsSchema.parse(await params);
    const body = await request.json();
    console.log("Incoming body:", body);
    const data = ReminderSchema.create.parse(body);

    const reminder = await ReminderService.create(
      { ...data, leadId: id },
      { id: profile.id, role: profile.role },
    );

    return NextResponse.json({ success: true, data: reminder });
  } catch (error) {
    console.error("Error creating reminder", error);
    return handleRouteError(error);
  }
}