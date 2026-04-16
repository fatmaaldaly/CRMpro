import { Role } from "@/generated/prisma/client";
import {ImportExportSchema, ImportExportService,} from "@/services/import-export";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const profile = await authenticateUser([Role.ADMIN]);

    const body = await request.json();
    const { rows } = ImportExportSchema.import.request.parse(body);

    const summary = await ImportExportService.import.process(rows, profile);

    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    return handleRouteError(error);
  }
}