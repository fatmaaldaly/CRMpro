"use client";

import Link from "next/link";
import { useState } from "react";
import { Inbox } from "lucide-react";

import { Role } from "@/generated/prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetLeads } from "@/lib/tanstack/useLeads";
import { CreateLeadDialog } from "@/components/leads/create-lead-dialog";
import { Pagination, StageBadge, StatusBadge } from "@/components/leads/reusable";

export function LeadsPageClient({ role }: { role: Role }) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const isManagerOrAdmin = role === "MANAGER" || role === "ADMIN";
  const canCreateLead = role !== "AGENT";

  const { data, isLoading, isError } = useGetLeads({ page, pageSize });

  const leads = data?.leads ?? [];
  const total = data?.pagination.total ?? 0;
  const pageCount = data?.pagination.pages ?? 0;
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = total === 0 ? 0 : Math.min(page * pageSize, total);
  const hasLeads = leads.length > 0;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            {role === "AGENT" ? "My Leads" : "Leads"}
          </h1>
          <p className="text-sm text-slate-500">
            Review the current leads and open a record for more details.
          </p>
        </div>

        {canCreateLead ? <CreateLeadDialog /> : null}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="px-6 py-16 text-sm text-slate-500">
            Loading leads...
          </div>
        ) : null}

        {isError ? (
          <div className="px-6 py-16 text-sm text-destructive">
            Failed to load leads.
          </div>
        ) : null}

        {!isLoading && !isError ? (
          hasLeads ? (
            <>
              <Table>
                <TableHeader className="[&_tr]:border-slate-200">
                  <TableRow>
                    <TableHead className="bg-slate-50/80 px-6 text-[11px] tracking-[0.18em] text-slate-500">Name</TableHead>
                    <TableHead className="bg-slate-50/80 px-5 text-[11px] tracking-[0.18em] text-slate-500">Email</TableHead>
                    <TableHead className="bg-slate-50/80 px-5 text-[11px] tracking-[0.18em] text-slate-500">Phone</TableHead>
                    <TableHead className="bg-slate-50/80 px-5 text-[11px] tracking-[0.18em] text-slate-500">Status</TableHead>
                    <TableHead className="bg-slate-50/80 px-5 text-[11px] tracking-[0.18em] text-slate-500">Stage</TableHead>
                    {isManagerOrAdmin ? (
                      <TableHead className="bg-slate-50/80 px-5 text-[11px] tracking-[0.18em] text-slate-500">
                        Assigned Agent
                      </TableHead>
                    ) : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id} className="border-slate-200 hover:bg-slate-50/80">
                      <TableCell className="px-6 py-4 font-medium text-slate-900">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="transition-colors hover:text-primary hover:underline"
                        >
                          {lead.name}
                        </Link>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-slate-600">{lead.email}</TableCell>
                      <TableCell className="px-5 py-4 text-slate-600">{lead.phone}</TableCell>
                      <TableCell className="px-5 py-4">
                        <StatusBadge status={lead.status} />
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <StageBadge stage={lead.stage} />
                      </TableCell>
                      {isManagerOrAdmin ? (
                        <TableCell className="px-5 py-4">
                          {lead.assignedTo ? (
                            <div className="space-y-1">
                              <p className="font-medium text-slate-900">{lead.assignedTo.name}</p>
                              <p className="text-xs text-slate-500">
                                {lead.assignedTo.email}
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-500">Unassigned</span>
                          )}
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Pagination startItem={startItem} endItem={endItem} total={total} page={page} pageCount={pageCount} isLoading={isLoading} setPage={setPage} />
            </>
          ) : (
            <div className="px-6 py-6">
              <div className="flex min-h-72 w-full flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-12 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-white ring-1 ring-slate-200">
                  <Inbox className="size-6 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-semibold text-slate-900">No leads yet</p>
                  <p className="max-w-md text-sm text-slate-500">
                    {canCreateLead
                      ? "Create your first lead to start building the pipeline for this CRM."
                      : "Leads assigned to you will appear here once a manager or admin adds them."}
                  </p>
                </div>
                {canCreateLead ? <CreateLeadDialog /> : null}
              </div>
            </div>
          )
        ) : null}
      </section>
    </div>
  );
}
