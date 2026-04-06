"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname(); // used to highlight active tab

  return (
    <div className="p-6 space-y-6">
      {/* Tabs bar */}
      <Tabs value={pathname} className="w-full">
        <TabsList>
          <TabsTrigger value="/admin/users" asChild>
            <Link href="/admin/users">Users</Link>
          </TabsTrigger>
          <TabsTrigger value="/admin/import" asChild>
            <Link href="/admin/import">Import</Link>
          </TabsTrigger>
          <TabsTrigger value="/admin/export" asChild>
            <Link href="/admin/export">Export</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Render the page content */}
      <div>{children}</div>
    </div>
  );
}