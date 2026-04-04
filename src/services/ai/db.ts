import { prisma } from "@/lib/prisma";
import { SaveCallFollowupRequest, SaveLeadBriefRequest } from "./schema";
import { Profile } from "@/generated/prisma/client";


// gets basic info about a lead
export async function dbGetLeadWithContext(leadId: string) {
  return await prisma.lead.findUnique({
    // only activities for this lead
    where: { id: leadId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      stage: true,
      status: true,
      assignedTo: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
    },
  });
}


// gets latest activities for a lead
// take: max number of rows to fetch
export async function dbGetRecentActivities(leadId: string, limit = 20) {
  return await prisma.activity.findMany({
    where: { leadId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      type: true,
      content: true,
      createdAt: true,
      actor: {
        select: { name: true },
      },
    },
  });
}


// gets the next upcoming reminder for a specific lead
// findFirst(): return only one row
export async function dbGetNextReminder(leadId: string) {
  return await prisma.reminder.findFirst({
    where: {
      leadId,
      status: "PENDING",
      dueAt: {
        gte: new Date(),
      },
    },
    orderBy: { dueAt: "asc" },
    select: {
      id: true,
      title: true,
      note: true,
      dueAt: true,
    },
  });
}


// creates a new AI-generated lead summary (brief)
// export async function dbCreateLeadBrief(
//   request: SaveLeadBriefRequest,
//   user: Profile,
// ) {
//   return await prisma.aILeadBrief.create({
//     // Data being saved in the DB
//     // Save a new AI brief for a lead and link it to the user who created it
//     data: {
//       leadId: request.leadId,
//       brief: request.brief,
//       createdById: user.id,
//     },
//   });
// }
export async function dbCreateLeadBrief(
  request: SaveLeadBriefRequest,
  user: Profile,
) {
  const normalizedBrief = {
    summary: request.brief.summary || "",
    keyFacts: request.brief.keyFacts || [],
    risks: request.brief.risks || [],
    nextActions: request.brief.nextActions || [],
    questionsToAskNext: request.brief.questionsToAskNext || [],
  };

  return await prisma.aILeadBrief.create({
    data: {
      leadId: request.leadId,
      brief: normalizedBrief,
      createdById: user.id,
    },
  });
}


// gets the most recent AI brief for a lead
// export async function dbGetLastLeadBrief(leadId: string) {
//   return await prisma.aILeadBrief.findFirst({
//     where: { leadId },
//     orderBy: { createdAt: "desc" },
//     select: {
//       id: true,
//       leadId: true,
//       brief: true,
//       createdAt: true,
//       updatedAt: true,
//       createdById: true,
//     },
//   });
// }


export async function dbGetLastLeadBrief(leadId: string) {
  const row = await prisma.aILeadBrief.findFirst({
    where: { leadId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      leadId: true,
      brief: true,
      createdAt: true,
      updatedAt: true,
      createdById: true,
    },
  });

  if (!row) return null;

  const brief = row.brief
    ? typeof row.brief === "string"
      ? JSON.parse(row.brief)
      : row.brief
    : {};

  return {
    ...row,
    brief: {
      summary: brief.summary || "",
      keyFacts: brief.keyFacts || [],
      risks: brief.risks || [],
      nextActions: brief.nextActions || [],
      questionsToAskNext: brief.questionsToAskNext || [],
    },
  };
}



export async function dbCreateCallFollowup(
  request: SaveCallFollowupRequest,
  user: Profile) {

    return await prisma.aILeadBrief.create({

      data: {
        leadId: request.leadId,
        brief: request.callFollowup,
        createdById: user.id,
      },
    })
  
}
