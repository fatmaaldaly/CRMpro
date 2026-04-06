import { Role } from "@/generated/prisma/client";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import {ImportExportService} from "@/services/import-export/index";


export async function GET() {
  try {
    const profile = await authenticateUser([Role.AGENT, Role.MANAGER, Role.ADMIN]);
    const csv = await ImportExportService.export.process(profile);
    const filename = `leads-export-${new Date().toISOString().split("T")[0]}.csv`;

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}