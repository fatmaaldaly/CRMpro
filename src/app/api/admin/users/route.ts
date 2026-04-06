import { authenticateUser } from "@/utils/authenticateUser";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@/generated/prisma/enums";
import { handleRouteError } from "@/utils/handleRouteError";
import { AdminSchema, AdminService } from "@/services/admin";

// ------------------------------------------------------------------
// GET /api/admin/users — List all users
// ------------------------------------------------------------------
export async function GET() {
  try {
    // Only admins can see the user list.
    // If a non-admin calls this, authenticateUser throws a 403.
    await authenticateUser([Role.ADMIN]);

    const users = await AdminService.user.list();

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return handleRouteError(error);
  }
}

// ------------------------------------------------------------------
// POST /api/admin/users — Create a new user with invitation
// ------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    await authenticateUser([Role.ADMIN]);

    // Parse and validate the request body with Zod.
    // If validation fails, Zod throws a ZodError which
    // handleRouteError catches and returns as a 400.
    const body = await request.json();
    const data = AdminSchema.user.create.parse(body);

    // Create the user (auth + profile + magic link + email).
    // The service handles all 4 steps internally.
    const user = await AdminService.user.create(data);

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}