"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Inbox, Users } from "lucide-react";

import { Role } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import  ExportButton  from "@/components/leads/ExportButton";
import { ReassignLeadsDialog } from "@/components/leads/ReassignLeadsDialog";
import { Pagination, StageBadge, StatusBadge } from "@/components/leads/reusable";

export function LeadsPageClient({ role }: { role: Role }) {
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const pageSize = 10;
  const isManagerOrAdmin = role === "MANAGER" || role === "ADMIN";
  const canCreateLead = role !== "AGENT";

  const { data, isLoading, isError } = useGetLeads({ page, pageSize });

  const leads = useMemo(() => data?.leads ?? [], [data]);
  const total = data?.pagination.total ?? 0;
  const pageCount = data?.pagination.pages ?? 0;
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = total === 0 ? 0 : Math.min(page * pageSize, total);
  const hasLeads = leads.length > 0;

  const allOnPageSelected = useMemo(
    () => hasLeads && leads.every((lead) => selectedIds.has(lead.id)),
    [hasLeads, leads, selectedIds],
  );
  const someOnPageSelected = useMemo(
    () => leads.some((lead) => selectedIds.has(lead.id)),
    [leads, selectedIds],
  );

  const toggleAllOnPage = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const lead of leads) {
        if (checked) next.add(lead.id);
        else next.delete(lead.id);
      }
      return next;
    });
  };

  const toggleOne = (leadId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(leadId);
      else next.delete(leadId);
      return next;
    });
  };

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

        <div className="flex items-center gap-2">
          {isManagerOrAdmin && selectedIds.size > 0 ? (
            <Button onClick={() => setShowReassignDialog(true)}>
              <Users className="mr-2 h-4 w-4" />
              Reassign {selectedIds.size}{" "}
              {selectedIds.size === 1 ? "lead" : "leads"}
            </Button>
          ) : null}
          <ExportButton />
          {canCreateLead ? <CreateLeadDialog /> : null}
        </div>
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
                    {isManagerOrAdmin ? (
                      <TableHead className="bg-slate-50/80 px-6 w-10">
                        <Checkbox
                          checked={
                            allOnPageSelected
                              ? true
                              : someOnPageSelected
                                ? "indeterminate"
                                : false
                          }
                          onCheckedChange={(checked) =>
                            toggleAllOnPage(checked === true)
                          }
                          aria-label="Select all leads on this page"
                        />
                      </TableHead>
                    ) : null}
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
                    <TableRow
                      key={lead.id}
                      data-state={selectedIds.has(lead.id) ? "selected" : undefined}
                      className="border-slate-200 hover:bg-slate-50/80 data-[state=selected]:bg-primary/5"
                    >
                      {isManagerOrAdmin ? (
                        <TableCell className="px-6 py-4 w-10">
                          <Checkbox
                            checked={selectedIds.has(lead.id)}
                            onCheckedChange={(checked) =>
                              toggleOne(lead.id, checked === true)
                            }
                            aria-label={`Select ${lead.name}`}
                          />
                        </TableCell>
                      ) : null}
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

      {isManagerOrAdmin ? (
        <ReassignLeadsDialog
          open={showReassignDialog}
          onOpenChange={setShowReassignDialog}
          selectedLeadIds={Array.from(selectedIds)}
          onSuccess={() => setSelectedIds(new Set())}
        />
      ) : null}
    </div>
  );
}
