import { Role } from "@/generated/prisma/enums";
import { createLeadSchema, listLeadsQuerySchema } from "@/services/lead/schema";
import {
  createLead,
  LeadServiceError,
  listLeads,
} from "@/services/lead/service";
import {
  authenticateUser,
  AuthenticationError,
} from "@/utils/authenticateUser";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

// GET /api/leads?page=1&pageSize=10
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const profile = await authenticateUser();

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");

    // Validate query params
    const params = listLeadsQuerySchema.parse({
      page,
      pageSize,
    });

    // Get leads
    const leads = await listLeads(profile, params);

    // Return response
    return NextResponse.json({ success: true, data: leads });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    if (error instanceof LeadServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const profile = await authenticateUser([Role.ADMIN, Role.MANAGER]);

    // Get request body
    const body = await request.json();
    const data = createLeadSchema.parse(body);

    // Create lead
    const lead = await createLead(profile, data);

    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    if (error instanceof LeadServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
