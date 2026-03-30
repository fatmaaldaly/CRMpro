import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/utils/handleRouteError";
import { updateReminderSchema } from "@/services/reminder/schema";
import { authenticateUser } from "@/utils/authenticateUser";
import { updateReminder } from "@/services/reminder/service";
import { reminderIdSchema } from "@/services/reminder/schema";


export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Authenticate the user
    const profile = await authenticateUser();
    const { id } = reminderIdSchema.parse(await params);
    const body = await request.json();
    const data = updateReminderSchema.parse(body);

    // Validate reminder exists
    // Check authorization (assigned user / manager / admin)
    // Cancel QStash scheduled message
    // Update status in DB
    // All handled inside cancelReminder service
    
    // Update status (CANCELLED or FIRED)
    const reminder = await updateReminder(id, { status: data.status }, {
      id: profile.id,
      role: profile.role,
    });

    return NextResponse.json({ success: true, data: reminder });
  } catch (error) {
    console.error("Error updating reminder", error);
    return handleRouteError(error);
  }
}