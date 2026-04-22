// data cleaning on the frontend before touching the db

"use client";
import { useImport } from "@/lib/tanstack/useImportExport";
import {AlertCircle, CheckCircle2, ChevronDown, ChevronRight, Download, Upload} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Table, TableRow, TableHeader, TableHead, TableBody, TableCell } from "../ui/table";
import { RowValidationResult } from "@/services/import-export/schema";
import { generateTemplateCSV, parseCSV, validateRows } from "@/services/import-export/helpers";

const PREVIEW_ROW_LIMIT = 10;
const PREVIEW_AUTO_COLLAPSE_THRESHOLD = 50;

// nothing uploaded, reading csv, results ready, sending to backend
type ImportState = "idle" | "parsing" | "validated" | "importing";

export function CSVImporter() {
  const [state, setState] = useState<ImportState>("idle");
  const [results, setResults] = useState<RowValidationResult[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const { mutate: importCSV } = useImport();


  // --- File selection handler ---
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setState("parsing");

    try {
      // Step 1: Parse the CSV file (papaparse, client-side)
      const rows = await parseCSV(file);

      // Step 2: Validate each row (Zod, client-side)
      const validationResults = validateRows(rows);
      setResults(validationResults);
      setState("validated");

      const validCount = validationResults.filter((r) => r.valid).length;
      const invalidCount = validationResults.filter((r) => !r.valid).length;
      // If: small dataset → auto open preview, large dataset → collapse it
      setIsPreviewOpen(
        validCount > 0 && validCount <= PREVIEW_AUTO_COLLAPSE_THRESHOLD,
      );
      toast.info(
        `Parsed ${validationResults.length} rows: ${validCount} valid, ${invalidCount} invalid`,
      );
    } catch {
      toast.error("Failed to parse CSV file. Check the format and try again.");
      setState("idle");
    }

    // Reset the file input so the same file can be re-selected
    e.target.value = "";
  }

  // --- Submit valid rows ---
  // Importing Data (Frontend → Backend)
  function handleImport() {
    const validRows = results
      .filter((r) => r.valid && r.data !== null)
      .map((r) => r.data!);

    if (validRows.length === 0) {
      toast.error("No valid rows to import");
      return;
    }

    setState("importing");
    // send data to backend
    importCSV({ rows: validRows }, {
      onSuccess: (data) => {
        const msg = `Imported ${data.importedCount} rows`;
        const errMsg = data.errors.length > 0 ? `${data.errors.length} errors occurred.` : "";
        toast.success(msg + " " + errMsg);

        setResults([]);
        setState("idle");
      },
      // Keeps results → user can retry
      onError: (error: Error) => {
        toast.error(error.message);
        setState("validated");
      }
    })
  }

  // --- Template download ---
  function handleDownloadTemplate() {
    const csv = generateTemplateCSV();
    // Convert text to downloadable file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "leads-import-template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // --- Computed values ---
  const validResults = results.filter((r) => r.valid && r.data !== null);
  const validCount = validResults.length;
  const invalidCount = results.length - validCount;
  const previewRows = validResults.slice(0, PREVIEW_ROW_LIMIT);

  if (state === "validated" && results.length > 0 && validCount === 0) {
  return (
    <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
      No valid CSV data found. Please check your file format.
    </div>
  );
}

  return (
    <div className="space-y-6">
      {/* --- File Upload Area --- */}
      <div className="rounded-lg border-2 border-dashed p-8 text-center">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          disabled={state === "parsing" || state === "importing"}
          className="hidden"
          id="csv-file-input"
        />
        <label htmlFor="csv-file-input" className="cursor-pointer focus:outline-none focus:ring-2">
          <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
          <div className="text-sm font-medium">
            {state === "parsing"
              ? "Parsing..."
              : "Click to select a CSV file"}
          </div>
          <div className="text-xs text-muted-foreground">
            CSV files only. Max recommended: 1,000 rows.
          </div>
        </label>
      </div>

      {/* --- Template Download --- */}
      <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
        <Download className="mr-2 h-4 w-4" />
        Download Template CSV
      </Button>

      {/* --- Validation Report --- */}
      {state !== "idle" && results.length > 0 && (
        <>
          {/* Summary badges */}
          <div className="flex gap-3">
            <Badge
              variant="outline"
              className="border-green-200 text-green-700 bg-green-50"
            >
              <CheckCircle2 className="mr-1 h-3 w-3" />
              {validCount} valid
            </Badge>
            {invalidCount > 0 && (
              <Badge
                variant="outline"
                className="border-red-200 text-red-700 bg-red-50"
              >
                <AlertCircle className="mr-1 h-3 w-3" />
                {invalidCount} invalid
              </Badge>
            )}
            <Badge variant="outline">
              {results.length} total rows
            </Badge>
          </div>

          {/* Valid rows preview */}
          {validCount > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-green-700">
                  Preview valid rows ({validCount})
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPreviewOpen((open) => !open)}
                >
                  {isPreviewOpen ? (
                    <>
                      <ChevronDown className="mr-1 h-4 w-4" />
                      Hide
                    </>
                  ) : (
                    <>
                      <ChevronRight className="mr-1 h-4 w-4" />
                      Show
                    </>
                  )}
                </Button>
              </div>
              {isPreviewOpen && (
                <div className="rounded-md border max-h-72 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Row</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Assignee Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewRows.map((r) => (
                        <TableRow key={r.rowNumber}>
                          <TableCell className="font-mono text-xs">
                            {r.rowNumber}
                          </TableCell>
                          <TableCell className="text-xs">
                            {r.data!.phone}
                          </TableCell>
                          <TableCell className="text-xs">
                            {r.data!.name}
                          </TableCell>
                          <TableCell className="text-xs">
                            {r.data!.email}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {r.data!.assigneeEmail ?? "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {validCount > PREVIEW_ROW_LIMIT && (
                    <p className="border-t bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                      Showing {PREVIEW_ROW_LIMIT} of {validCount} valid rows
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Invalid rows table */}
          {invalidCount > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-red-600">
                Invalid Rows
              </h3>
              <div className="rounded-md border max-h-60 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Row</TableHead>
                      <TableHead>Field</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results
                      .filter((r) => !r.valid)
                      .flatMap((r) =>
                        Object.entries(r.errors ?? {}).map(
                          ([field, messages]) => (
                            <TableRow key={`${r.rowNumber}-${field}`}>
                              <TableCell className="font-mono text-xs">
                                {r.rowNumber}
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {field}
                              </TableCell>
                              <TableCell className="text-xs text-red-600">
                                {(messages as string[])[0]}
                              </TableCell>
                            </TableRow>
                          ),
                        ),
                      )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setResults([]);
                setState("idle");
              }}
              disabled={state === "importing"}
            >
              Clear
            </Button>
            <Button
              onClick={handleImport}
              disabled={validCount === 0 || state === "importing"}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {state === "importing"
                ? "Importing..."
                : `Import ${validCount} Valid Rows`}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}