import { Role } from "@/generated/prisma/client";
import { UserSnapshot } from "@/utils/types/user";
import {
  dbCountLeadsCreatedInRange,
  dbGetOverdueRemindersCount,
  dbGetTopAgents,
  dbGetTotalLeads,
  dbGetTotalLeadsByStage,
  dbGetTotalLeadsByStatus,
  dbGetWonAndTotalLeads,
  dbGetAgentLeaderboard,
  dbGetAverageCloseTime,
  dbGetStuckLeads,
} from "./db";
import { startOfUtcWeekSunday } from "./helpers";


export class DashboardServiceError extends Error {
    constructor(
        message: string,
        public statusCode : number,
    ) {
        super(message);
        this.name = "DashboardServiceError";
    }
}


// Builds all dashboard data based on the logged-in user
export async function getDashboardData(user: UserSnapshot) {
  // role based data access: if user is agent, only show leads assigned to this agent 
  const where = {
    ...(user.role === Role.AGENT && { assignedToId: user.id }),
  };

  const now = new Date();
  const thisWeekStartUtc = startOfUtcWeekSunday(now);
  const lastWeekStartUtc = new Date(thisWeekStartUtc);
  lastWeekStartUtc.setUTCDate(lastWeekStartUtc.getUTCDate() - 7);

  const [
    totalLeads,
    totalLeadsByStage,
    totalLeadsByStatus,
    overdueRemindersCount,
    newLeadsThisWeekCount,
    newLeadsLastWeekCount,
    { total: conversionTotal, won: conversionWon },
  ] = await Promise.all([
    dbGetTotalLeads(where),
    dbGetTotalLeadsByStage(where),
    dbGetTotalLeadsByStatus(where),
    dbGetOverdueRemindersCount(where),
    dbCountLeadsCreatedInRange(where, {
      gte: thisWeekStartUtc,
      lte: now,
    }),
    dbCountLeadsCreatedInRange(where, {
      gte: lastWeekStartUtc,
      lt: thisWeekStartUtc,
    }),
    dbGetWonAndTotalLeads(where),
  ]);

  // How much did leads increase/decrease compared to last week
  const percentChangeFromLastWeek =
    newLeadsLastWeekCount === 0
      ? null
      : ((newLeadsThisWeekCount - newLeadsLastWeekCount) /
          newLeadsLastWeekCount) *
        100;
  // How much of the total leads got converted to won
  const conversionRate =
    conversionTotal === 0 ? 0 : (conversionWon / conversionTotal) * 100;

  let topAgents: Awaited<ReturnType<typeof dbGetTopAgents>> = [];

  if (user.role !== Role.AGENT) {
    topAgents = await dbGetTopAgents();
  }

  return {
    totalLeads,
    totalLeadsByStage,
    totalLeadsByStatus,
    overdueRemindersCount,
    newLeadsThisWeek: {
      count: newLeadsThisWeekCount,
      lastWeekCount: newLeadsLastWeekCount,
      percentChangeFromLastWeek,
    },
    conversionRate: {
      percentage: conversionRate,
      won: conversionWon,
      total: conversionTotal,
    },
    ...(user.role !== Role.AGENT && { topAgents }),
  };
}


export async function getManagerReport(user: UserSnapshot) {
  // only manager allowed
  if (user.role === Role.AGENT || user.role === Role.ADMIN) {
    throw new DashboardServiceError("Unauthorized", 403);
  }
  
  const where = {
  ...(user.role === Role.MANAGER && { assignedToId: user.id }),
};

  const [
    totalLeads,
    totalLeadsByStage,
    totalLeadsByStatus,
    overdueRemindersCount,
    stuckLeads,
    leaderboard,
    avgCloseTime,
    { total: conversionTotal, won: conversionWon },
  ] = await Promise.all([
    dbGetTotalLeads(where),
    dbGetTotalLeadsByStage(where),
    dbGetTotalLeadsByStatus(where),
    dbGetOverdueRemindersCount(where),
    dbGetStuckLeads(3),
    dbGetAgentLeaderboard(),
    dbGetAverageCloseTime(),
    dbGetWonAndTotalLeads(where),
  ]);

  const conversionRate =
    conversionTotal === 0 ? 0 : (conversionWon / conversionTotal) * 100;

  return {
    totalLeads,
    conversionRate,
    overdueRemindersCount,
    stuckLeads,
    leaderboard,
    avgCloseTime,
    totalLeadsByStage,
    totalLeadsByStatus,
  };
}