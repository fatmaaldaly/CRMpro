import { getDashboardData, getManagerReport } from "./service";

export type DashboardData = {
  totalLeads: Awaited<ReturnType<typeof getDashboardData>>["totalLeads"];
  totalLeadsByStage: Awaited<
    ReturnType<typeof getDashboardData>
  >["totalLeadsByStage"];
  totalLeadsByStatus: Awaited<
    ReturnType<typeof getDashboardData>
  >["totalLeadsByStatus"];
  overdueRemindersCount: Awaited<
    ReturnType<typeof getDashboardData>
  >["overdueRemindersCount"];
  newLeadsThisWeek: Awaited<
    ReturnType<typeof getDashboardData>
  >["newLeadsThisWeek"];
  conversionRate: Awaited<
    ReturnType<typeof getDashboardData>
  >["conversionRate"];
  topAgents?: Awaited<ReturnType<typeof getDashboardData>>["topAgents"];
};


export type ManagerReport = {
  totalLeads: Awaited<
    ReturnType<typeof getManagerReport>
  >["totalLeads"];

  conversionRate: Awaited<
    ReturnType<typeof getManagerReport>
  >["conversionRate"];

  overdueRemindersCount: Awaited<
    ReturnType<typeof getManagerReport>
  >["overdueRemindersCount"];

  totalLeadsByStage: Awaited<
    ReturnType<typeof getManagerReport>
  >["totalLeadsByStage"];

  totalLeadsByStatus: Awaited<
    ReturnType<typeof getManagerReport>
  >["totalLeadsByStatus"];

  stuckLeads: Awaited<
    ReturnType<typeof getManagerReport>
  >["stuckLeads"];

  leaderboard: Awaited<
    ReturnType<typeof getManagerReport>
  >["leaderboard"];

  avgCloseTime: Awaited<
    ReturnType<typeof getManagerReport>
  >["avgCloseTime"];
};