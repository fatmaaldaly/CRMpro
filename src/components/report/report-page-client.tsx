"use client";

import { AlertCircle, Percent, Users } from "lucide-react";
import KpiCard from "./KpiCard";
import { Role } from "@/generated/prisma/enums";
import { useReport } from "@/lib/tanstack/useReport";
import StuckLeadsChart from "./StuckLeadsChart";
import PipelineStages from "./PipelineStages";

export function Report({ role }: { role: Role }) {
  const { data: report } = useReport();

  return (
    <div className="space-y-6 p-4">

      {role !== "AGENT" && report && (
        <div className="space-y-6 mt-8">

          <h2 className="text-3xl font-semibold tracking-tight">
            Report
          </h2>

          {/* KPI ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard
              label="Org Conversion Rate"
              value={`${report.conversionRate.toFixed(1)}%`}
              icon={<Percent className="h-4 w-4 text-muted-foreground" />}
            />

            <KpiCard
              label="Avg Close Time"
              value={`${report.avgCloseTime.toFixed(1)} days`}
              icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
            />

            <KpiCard
              label="Stuck Leads"
              value={report.stuckLeads.reduce((a, s) => a + s.count, 0)}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
          </div>

          {/* MAIN REPORT GRID (FIXED) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* LEADERBOARD */}
            <div className="bg-card rounded-lg border shadow-sm p-4">
              <h3 className="font-medium mb-3">Leaderboard</h3>

              <div className="space-y-2">
                {report.leaderboard
                  .sort((a, b) => b.conversionRate - a.conversionRate)
                  .map((agent) => (
                    <div key={agent.name} className="flex justify-between text-sm">
                      <span>{agent.name}</span>
                      <span className="text-muted-foreground">
                        {agent.conversionRate.toFixed(1)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* PIPELINE STAGES */}
        
            <PipelineStages data={report.totalLeadsByStage} />
            {/* STUCK LEADS */}
            <StuckLeadsChart data={report.stuckLeads} />

          </div>

        </div>
      )}

    </div>
  );
}