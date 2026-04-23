import { prisma } from "@/lib/prisma";
import { DigestStatus, LeadStatus, Role } from "@/generated/prisma/client";
import { ManagerDigestRequest } from "./schema";


// Show leads that are still open but inactive for X days
export async function dbGetStuckLeads(days: number) {
  // gets current date/time
  const date = new Date();
  // getDate() → gets today’s day number
  // calculate when the lead got stuck, at what date
  date.setDate(date.getDate() - days);

  const result = await prisma.lead.groupBy({
    by: ["stage"],
    where: {
      updatedAt: { lt: date }, // not updated recently (stuck)
      status: LeadStatus.OPEN, // still active, not won/lost
    },
    _count: { _all: true }, // Count how many leads fall into each stage
  });

  return result.map((item) => ({
    stage: item.stage,
    count: item._count._all,
  }))
}


export async function dbGetWonLeads() {
  return prisma.lead.count({
    where: { status: LeadStatus.WON },
  });
}


export async function dbGetTotalLeads() {
  return prisma.lead.count();
}


export async function dbGetLeadsByStage() {
  const result = await prisma.lead.groupBy({
    by: ["stage"],
    _count: { _all: true },
  });
  return  result.map((item) => ({
    stage: item.stage,
    count: item._count,
  }))
}


export async function dbGetAgentPerformance() {
  return prisma.profile.findMany({
    where: { role: Role.AGENT, isActive: true },
    select: {
      id: true,
      name: true,
      leads: {
        select: { status: true },
      },
    },
  });
}


export async function dbGetManagers() {
  return prisma.profile.findMany({
    where: {
      role: Role.MANAGER,
      isActive: true,
    },
    select: {
      email: true,
      name: true,
    },
  })
  
}



/* =========================================================
   CREATE DIGEST
========================================================= */
export async function dbCreateDigest(content: ManagerDigestRequest) {
  return prisma.managerDigest.create({
    data: {
      content,
      status: DigestStatus.PENDING,
    },
  });
}

/* =========================================================
   UPDATE STATUS
========================================================= */
export async function dbUpdateDigestStatus(
  id: string,
  status: "PENDING" | "SENT" | "FAILED",
  sentAt?: Date
) {
  return prisma.managerDigest.update({
    where: { id },
    data: {
      status,
      ...(sentAt ? { sentAt } : {}),
    },
  });
}

