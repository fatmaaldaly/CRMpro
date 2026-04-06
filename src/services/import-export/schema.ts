import { z } from "zod";

export const csvLeadRowSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      "Phone must be a valid E.164 number (e.g., +15551234567)",
    ),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim(), // remove whitespace from name
  email: z.email("Invalid email address"),
  assigneeEmail: z
    .email("Invalid email address")
    // allows input as undefined
    .optional()
    // allows input as empty string
    .or(z.literal(""))
    // converts "" to undefined for easier handling in the code
    .transform((val) => (val === "" ? undefined : val)),
});

export type CSVLeadRow = z.infer<typeof csvLeadRowSchema>;

export const importRequestSchema = z.object({
  rows: z.array(csvLeadRowSchema),
});

export type ImportRequest = z.infer<typeof importRequestSchema>;

// ------------------------------------------------------------------
// VALIDATION RESULT
// ------------------------------------------------------------------
// One result per row — tells the UI whether the row is valid
// and what errors it has.
export interface RowValidationResult {
  rowNumber: number; // CSV row number (header is row 1, data starts at 2)
  valid: boolean;
  data: CSVLeadRow | null;
  errors: Record<string, string[]> | null;
}

// ------------------------------------------------------------------
// IMPORT SUMMARY
// ------------------------------------------------------------------
// Returned by the server after processing the import.
export interface ImportSummary {
  importedCount: number;
  totalProcessed: number;
  errors: string[];
}