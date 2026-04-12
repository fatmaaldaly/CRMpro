// Admin page for CSV lead imports.
// Same auth pattern as the users page: server-side role check.

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { CSVImporter } from "@/components/admin/CsvImporter";

export const metadata = {
  title: "Import Leads — CRM Pro Admin",
};


// it’s async because we fetch data from Supabase and Prisma
export default async function AdminImportPage() {
  // 1) authentication
  // connects to Supabase from the server
  const supabase = await createSupabaseServerClient();
  // gets the currently logged-in user
  const {data: { user },} = await supabase.auth.getUser();
  if (!user) redirect("/login");
  
  // 2) Authorization (role check)
  // Fetches the user profile from Prisma
  const profile = await prisma.profile.findUnique({
    // id is the column in prisma and user.id is the ID of the currently logged-in user (from Supabase)
    where: { id: user.id },
    select: { role: true, isActive: true },
  });
  
  // checks if user exists, if user is admin, and if account is active
  if (!profile || profile.role !== "ADMIN" || !profile.isActive) {
    // if any check fails redirect to dashboard
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
      <CSVImporter />
    </div>
  );
}