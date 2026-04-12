import { getDashboardData } from "./service";

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