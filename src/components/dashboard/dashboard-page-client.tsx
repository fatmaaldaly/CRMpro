"use client";

import { useDashboardOverview } from "@/lib/tanstack/useDashboard";
import { AlertCircle, Percent, UserPlus, Users } from "lucide-react";
import { useMemo } from "react";
import KpiCard from "./KpiCard";
import { Role } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import ByStageBreakdown from "./ByStageBreakdown";
import ByStatusBreakdown from "./ByStatusBreakdown";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";


// comparison between this week and last week: 
// if last week had 0 new leads, we can't calculate a % change, so we return null 
// Otherwise, we calculate the % change normally
function formatWeekOverWeekSubtext(
  percentChange: number | null,
): string | undefined {
  if (percentChange === null) {
    return "No new leads in the prior week to compare";
  }
  const sign = percentChange > 0 ? "+" : "";
  return `${sign}${percentChange.toFixed(1)}% vs last week`;
}

export function DashboardPageClient({ role }: { role: Role }) {
  const { data, isLoading, error } = useDashboardOverview();


  // useMemo avoids recalculating layout logic on every render.
  const { subHeaderText, secondRowGridStyle } = useMemo(() => {
    if (role === "AGENT") {
      return {
        subHeaderText: "Review the current state of your leads in your pipeline.",
        secondRowGridStyle: "grid-cols-1"
      }
    }
    return {
      subHeaderText: "Review the current state of the pipeline in your organization.",
      secondRowGridStyle: "grid-cols-3"
    }
    // Recompute only when role changes
  }, [role]);
  
  if (isLoading) 
    return <div className="p-4 text-sm text-muted-foreground">Loading dashboard...</div>;
  if (error || !data)
    return <div  className="p-4 text-sm text-red-500">Error: {error?.message ?? "Unknown error"}</div>;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {role === "AGENT" || role === "ADMIN" && (
        <>
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">{subHeaderText}</p>
      </div>
      {/*responsive grid: 1 column on mobile, 2 columns on tablet, 4 columns on desktop */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total leads"
          value={data.totalLeads}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          label="New leads this week"
          value={data.newLeadsThisWeek.count}
          icon={<UserPlus className="h-4 w-4 text-muted-foreground" />}
          subValue={formatWeekOverWeekSubtext(
            data.newLeadsThisWeek.percentChangeFromLastWeek,
          )}
        />
        {/* conversion rate: % of total leads that have been won */}
        <KpiCard
          label="Conversion rate"
          value={`${data.conversionRate.percentage.toFixed(1)}%`}
          icon={<Percent className="h-4 w-4 text-muted-foreground" />}
          subValue={`${data.conversionRate.won} won / ${data.conversionRate.total} total leads`}
        />
        
        {/* overdue: how many follow-ups are late */}
        <KpiCard
          label="Overdue reminders"
          value={data.overdueRemindersCount}
          icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
    
      {/* cn(): merges tailwind classess safely */}
      <div className={cn("grid gap-4", secondRowGridStyle)}>
        <ByStageBreakdown data={data.totalLeadsByStage} />
        
        <ByStatusBreakdown data={data.totalLeadsByStatus} />
        {/* conditional rendering */}
        {/* If backend returns topAgents → show leaderboard, If not (agent role) → hide it */}
        {data.topAgents ? (<Card>
          <CardHeader>
            <CardTitle>Top Performing Agents</CardTitle>
            <CardContent>
              {data.topAgents.map((agent) => (
                <div key={agent.id} className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">Won {agent.wonCount} of {agent.leadsCount} leads</p>
                </div>
              ))}
            </CardContent>
          </CardHeader>
        </Card>) : <></>}
      </div> 
      </>
      )}


      {/* ================= MANAGER REPORTS ================= */}
      {/* {role !== "AGENT" && role !== "ADMIN" && (
        <ManagerReport role={role} />
      )} */}
   </div>
  );
}