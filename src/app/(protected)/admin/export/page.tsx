import  ExportButton  from "@/components/leads/ExportButton";

export default function AdminExportPage() {
  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Export Leads</h1>
      <p className="text-muted-foreground">
        Click the button below to export your leads as a CSV file.
      </p>
      <ExportButton />
    </div>
  );
}