import {LeadStage, LeadStatus, Prisma, ReminderStatus, Role} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function dbGetTotalLeads(where: Prisma.LeadWhereInput) {
  return await prisma.lead.count({ where });
}

function sortStages() {
  return [
    LeadStage.NEW,
    LeadStage.CONTACTED,
    LeadStage.QUALIFIED,
    LeadStage.NEGOTIATING,
  ];
}

// Takes a filter (where), goes to db, counts how many leads are in each stage, returns them sorted in a specific order
export async function dbGetTotalLeadsByStage(where: Prisma.LeadWhereInput) {
  // step1: group data in db
  const result = await prisma.lead.groupBy({
    where,
    by: ["stage"],
    _count: {
      _all: true,
    },
  });
  // step2: transform the result (clean it)
  return result
    .map((item) => ({
      stage: item.stage,
      count: item._count._all,
    }))
    // - Smaller index = comes first
    .sort(
      (a, b) => sortStages().indexOf(a.stage) - sortStages().indexOf(b.stage),
    );
}

export async function dbGetTotalLeadsByStatus(where: Prisma.LeadWhereInput) {
  const result = await prisma.lead.groupBy({
    where,
    by: ["status"],
    _count: {
      _all: true,
    },
  });

  return result.map((item) => ({
    status: item.status,
    count: item._count._all,
  }));
}

export async function dbCountLeadsCreatedInRange(
  baseWhere: Prisma.LeadWhereInput,
  createdAt: Prisma.DateTimeFilter,
) {
  return prisma.lead.count({
    where: {
      ...baseWhere,
      createdAt,
    },
  });
}

export async function dbGetWonAndTotalLeads(baseWhere: Prisma.LeadWhereInput) {
  const [total, won] = await Promise.all([
    prisma.lead.count({ where: baseWhere }),
    prisma.lead.count({
      where: {
        ...baseWhere,
        status: LeadStatus.WON,
      },
    }),
  ]);
  return { total, won };
}

export async function dbGetOverdueRemindersCount(
  where: Prisma.ReminderWhereInput,
) {
  return await prisma.reminder.count({
    where: {
      ...where,
      dueAt: { lt: new Date() }, // lt → less than, new Date() → current time
      status: { in: [ReminderStatus.PENDING, ReminderStatus.FIRED] },
    },
  });
}

export async function dbGetTopAgents(limit = 5) {
  const agents = await prisma.profile.findMany({
    where: {
      role: Role.AGENT,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      _count: {
        select: {
          leads: true,
        },
      },
      leads: {
        where: {
          status: LeadStatus.WON,
        },
        select: {
          id: true,
        },
      },
    },
  });

  return agents
    .map((agent) => {
      return {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        leadsCount: agent._count.leads,
        wonCount: agent.leads.length,
      };
    })
    .sort((a, b) => b.wonCount - a.wonCount)
    .slice(0, limit);
}



export async function dbGetAverageCloseTime() {
  const closedLeads = await prisma.lead.findMany({
    where: { status: "WON" },
    select: {
      createdAt: true,
      updatedAt: true,
    },
  });

  if (closedLeads.length === 0) return 0;

  const totalDays = closedLeads.reduce((sum, lead) => {
    const diff =
      new Date(lead.updatedAt).getTime() -
      new Date(lead.createdAt).getTime();

    return sum + diff;
  }, 0);

  return totalDays / closedLeads.length / (1000 * 60 * 60 * 24);
}



export async function dbGetAgentLeaderboard() {
  const agents = await prisma.profile.findMany({
    where: { role: "AGENT", isActive: true },
    select: {
      id: true,
      name: true,
      leads: {
        select: { status: true },
      },
    },
  });

  return agents.map((agent) => {
    const total = agent.leads.length;
    const won = agent.leads.filter((l) => l.status === "WON").length;
    const conversion = total === 0 ? 0 : (won / total) * 100;

    return {
      name: agent.name,
      totalLeads: total,
      wonLeads: won,
      conversionRate: conversion,
    };
  });
}


export async function dbGetStuckLeads(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const result = await prisma.lead.groupBy({
    by: ["stage"],
    where: {
      updatedAt: { lt: date },
      status: LeadStatus.OPEN,
    },
    _count: {_all: true},
  })
  return result.map((item) => ({
    stage: item.stage,
    count: item._count._all,
  }));
}