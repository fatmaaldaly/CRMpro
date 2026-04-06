import { Role } from "@/generated/prisma/browser";
import { AdminService } from "@/services/admin";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await authenticateUser([Role.ADMIN]);
    const { id } = await params;
    const user = await AdminService.user.reactivate(id);
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return handleRouteError(error);
  }
}