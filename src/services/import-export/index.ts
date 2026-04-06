import { csvLeadRowSchema, importRequestSchema } from "./schema";
import { processExport, processImport } from "./service";

export const ImportExportService = {
  import: {
    process: processImport,
  },
  export: {
    process: processExport,
  },
};

export const ImportExportSchema = {
  import: {
    request: importRequestSchema,
    csvLeadRow: csvLeadRowSchema,
  },
  export: {
    csvLeadRow: csvLeadRowSchema,
  },

};