// Admin page for CSV lead imports.
// Same auth pattern as the users page: server-side role check.

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { CSVImporter } from "@/components/admin/CsvImporter";

export const metadata = {
  title: "Import Leads — CRM Pro Admin",
};

export default async function AdminImportPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true, isActive: true },
  });

  if (!profile || profile.role !== "ADMIN" || !profile.isActive) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Import Leads</h1>
        <p className="text-muted-foreground mt-1">
          Upload a CSV file to bulk-create leads. All rows are validated before
          import.
        </p>
      </div>
      <h1>HELLO</h1>
      <CSVImporter />
    </div>
  );
}