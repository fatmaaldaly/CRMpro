import { Prisma, Profile, Role} from "@/generated/prisma/client";
import { LeadService } from "../lead";
import { dbFindProfileByEmail, dbGetLeadsForExport } from "./db";
import { CSVLeadRow, ImportSummary } from "./schema";
import { buildCSVString } from "./helpers";


export async function processImport(
  // an array of CSV rows already validated. Each row has { phone, name, email, assigneeEmail }
  rows: CSVLeadRow[],
  importerProfile: Profile,
): Promise<ImportSummary> {
  // number of successfully imported leads
  let importedCount = 0;
  // an array to collect human-readable error messages for rows that fail
  const errors: string[] = [];
  // Loop over each CSV row 
  for (const row of rows) {
    try {
      // --- Resolve assignee ---
      // If the CSV row includes an assigneeEmail, look up the
      // corresponding Profile. If not found, skip this row and
      // record the error — don't create an orphaned lead.
      let assignedToId: string | undefined;
      if (row.assigneeEmail) {
        const assignee = await dbFindProfileByEmail(row.assigneeEmail);

        if (!assignee) {
          errors.push(
            `Row (${row.phone}): Assignee "${row.assigneeEmail}" not found`,
          );
          // skip the rest of this row and move to the next CSV row
          continue;
        }

        // If the assignee exists but is deactivated 
        if (!assignee.isActive) {
          errors.push(
            `Row (${row.phone}): Assignee "${row.assigneeEmail}" is deactivated`,
          );
          continue;
        }

        assignedToId = assignee.id;
      }

      // --- Create lead ---
      const lead = await LeadService.createLead(importerProfile, row);

      // --- Assign if Assignee is Provided ---
      if (assignedToId) {
        await LeadService.updateLead(importerProfile, lead.id, {
          assignedToId,
        });
      }

      importedCount++;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      errors.push(`Row (${row.phone}): ${message}`);
    }
  }

  return {
    importedCount,
    totalProcessed: rows.length,
    errors,
  };
}


export async function processExport(profile: Profile): Promise<string> {
  
  // business logic
  const where: Prisma.LeadWhereInput =
    profile.role === Role.AGENT
      ? { assignedToId: profile.id }
      : {};
  
  // db call
  const leads = await dbGetLeadsForExport(where);
  
  // transformation
  const rows = leads.map((lead) => ({
    phone: lead.phone,
    name: lead.name,
    email: lead.email ?? "",
    assigneeEmail: lead.assignedTo?.email ?? "",
    stage: lead.stage,
    status: lead.status,
    createdAt: lead.createdAt.toISOString(),
  }));

  return buildCSVString(rows, [
    "phone", "name", "email", "assigneeEmail", "stage", "status", "createdAt",
  ]);
}