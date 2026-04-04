import { ReminderSchema, ReminderService } from "@/services/reminder";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await authenticateUser();
    const { id } = z.object({ id: z.uuid() }).parse(await params);
    const body = await request.json();
    const data = ReminderSchema.update.parse(body);

    if (data.status === "CANCELLED") {
      const result = await ReminderService.cancel(id, {
        id: profile.id,
        role: profile.role,
      });
      return NextResponse.json({ success: true, data: result });
    }

    if (data.status === "COMPLETED") {
      const result = await ReminderService.complete(id, {
        id: profile.id,
        role: profile.role,
      });
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json({ error: "Invalid operation" }, { status: 400 });
  } catch (error) {
    return handleRouteError(error);
  }
}