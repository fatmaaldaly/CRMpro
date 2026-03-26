import { editLeadSchema, leadIdParamsSchema } from "@/services/lead/schema";
import { getLead, LeadServiceError, updateLead } from "@/services/lead/service";
import {
  authenticateUser,
  AuthenticationError,
} from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await authenticateUser();
    const { id } = leadIdParamsSchema.parse(await params);
    const lead = await getLead(profile, id);

    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await authenticateUser();
    const { id } = leadIdParamsSchema.parse(await params);
    const body = await request.json();
    const data = editLeadSchema.parse(body);
    const lead = await updateLead(profile, id, data);

    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    if (
      error instanceof AuthenticationError ||
      error instanceof LeadServiceError
    ) {
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
