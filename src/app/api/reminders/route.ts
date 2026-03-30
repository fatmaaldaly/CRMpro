import { ReminderSchema, ReminderService } from "@/services/reminder";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const profile = await authenticateUser();

    const searchParams = request.nextUrl.searchParams;
    const validated = ReminderSchema.listMy.parse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      status: searchParams.get("status") || undefined,
    });

    const result = await ReminderService.listMy(validated, {
      id: profile.id,
      role: profile.role,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleRouteError(error);
  }
}