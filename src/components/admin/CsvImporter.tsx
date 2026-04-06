"use client";
import { useImport } from "@/lib/tanstack/useImportExport";
import { AlertCircle, CheckCircle2, Download, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Table, TableRow, TableHeader, TableHead, TableBody, TableCell } from "../ui/table";
import { RowValidationResult } from "@/services/import-export/schema";
import { generateTemplateCSV, parseCSV, validateRows } from "@/services/import-export/helpers";

//nothing happening (No file selected), papaparse running, results ready, api call running
type ImportState = "idle" | "parsing" | "validated" | "importing";

export function CSVImporter() {
  const [state, setState] = useState<ImportState>("idle");
  const [results, setResults] = useState<RowValidationResult[]>([]);
  const { mutate: importCSV, isPending } = useImport();



  // --- File selection handler ---
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    // user selects a file
    const file = e.target.files?.[0];
    if (!file) return;
    
    setState("parsing");

    try {
      // Step 1: Parse the CSV file (papaparse, client-side)
      const rows = await parseCSV(file);

      // Step 2: Validate each row (Zod, client-side)
      const validationResults = validateRows(rows);
      // save results
      setResults(validationResults);
      setState("validated");

      const validCount = validationResults.filter((r) => r.valid).length;
      const invalidCount = validationResults.filter((r) => !r.valid).length;
      toast.info(
        `Parsed ${validationResults.length} rows: ${validCount} valid, ${invalidCount} invalid`,
      );
    } catch {
      toast.error("Failed to parse CSV file. Check the format and try again.");
      // If something breaks, reset eveything
      setState("idle");
    }

    // Reset the file input so the same file can be re-selected
    e.target.value = "";
  }

  // --- Submit valid rows ---
  // Only clean data goes to backend
  function handleImport() {
    const validRows = results
      .filter((r) => r.valid && r.data !== null)
      .map((r) => r.data!);

    if (validRows.length === 0) {
      toast.error("No valid rows to import");
      return;
    }

    setState("importing");
    importCSV({ rows: validRows }, {
      onSuccess: (data) => {
        const msg = `Imported ${data.importedCount} rows`;
        const errMsg = data.errors.length > 0 ? `${data.errors.length} errors occurred.` : "";
        toast.success(msg + " " + errMsg);
        
        // Reset UI completely
        setResults([]);
        setState("idle");
      },
      onError: (error: Error) => {
        toast.error(error.message);
        // Keep results so user can retry
        setState("validated");
      }
    })
  }

  // --- Template download ---
  function handleDownloadTemplate() {
    const csv = generateTemplateCSV();
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
  const validCount = results.filter((r) => r.valid).length;
  const invalidCount = results.filter((r) => !r.valid).length;

  const validRows = results.filter((r) => r.valid && r.data !== null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(validCount <= 50);

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
        <label htmlFor="csv-file-input" className="cursor-pointer space-y-2">
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


          {/* Valid rows table */}
        
            <div className="space-y-2">
              <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            >
              {isPreviewOpen ? "Hide" : "Preview"} valid rows
            </Button>
            {isPreviewOpen && (
              // <h3 className="text-sm font-semibold text-green-600">
              //   Valid Rows
              // </h3>
              <div className="rounded-md border max-h-60 overflow-y-auto">
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
                    {validRows.slice(0, 10).map((r) => (
                      <TableRow key={r.rowNumber}>
                        <TableCell className="font-mono text-xs">{r.rowNumber}</TableCell>
                        <TableCell className="font-mono text-xs">{r.data?.phone || "-"}</TableCell>
                        <TableCell className="font-mono text-xs">{r.data?.name || "-"}</TableCell>
                        <TableCell className="font-mono text-xs">{r.data?.email || "-"}</TableCell>
                        <TableCell className="font-mono text-xs">{r.data?.assigneeEmail || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
             )}
            </div>
        

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