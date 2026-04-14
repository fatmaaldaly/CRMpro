import { Role } from "@/generated/prisma/client";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import {ImportExportService} from "@/services/import-export/index";


export async function GET() {
  try {
    const profile = await authenticateUser([Role.AGENT, Role.MANAGER, Role.ADMIN]);
    // fetch leads & convert them to csv format
    const csv = await ImportExportService.export.process(profile);
    // new Date().toISOString() → "2026-04-13T12:34:56.000Z"
    // .split("T")[0] → "2026-04-13"
    // generate filename: leads-export-2026-04-13.csv
    const filename = `leads-export-${new Date().toISOString().split("T")[0]}.csv`;

    // Sends the CSV file to the browser as a downloadable file
    return new Response(csv, {
      headers: {
        // tells browser this is a csv file
        "Content-Type": "text/csv; charset=utf-8",
        // forces download instead of display
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}