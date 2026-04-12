import { prisma } from "@/lib/prisma"; // prisma client, used to query the db
import {
  CreateLeadRequest,
  EditLeadRequest,
  LeadAssigneeSummary,
  LeadDetail,
  ListLeadsParams,
  ListLeadsResponseData,
} from "./schema";
import { Prisma, Profile, Role } from "@/generated/prisma/client"; // Prisma → types like LeadWhereInput, TransactionClient
import { buildPagination } from "@/utils/pagination";


// Select Objects, These define which fields to fetch from the db
const assigneeSelect = {
  id: true,
  name: true,
  email: true,
} satisfies Prisma.ProfileSelect; // ensures TypeScript checks that this object matches Prisma’s expected select type.

const leadSummarySelect = {
  id: true,
  name: true,
  phone: true,
  email: true,
  stage: true,
  status: true,
  createdAt: true,
  assignedToId: true,
  assignedTo: {
    select: assigneeSelect,
  },
} satisfies Prisma.LeadSelect;

// Extends leadSummarySelect by adding updatedAt, used for detailed lead view.
const leadDetailSelect = {
  ...leadSummarySelect,
  updatedAt: true,
} satisfies Prisma.LeadSelect;

export async function dbListLeads(
  where: Prisma.LeadWhereInput,
  params: ListLeadsParams,
): Promise<ListLeadsResponseData> {
  // Promise.all runs both queries in parallel: findMany and count
  const [leads, total] = await Promise.all([
    // fetches the lead records
    prisma.lead.findMany({
      where,
      select: leadSummarySelect,
      take: params.pageSize, // how many to fetch per page
      skip: (params.page - 1) * params.pageSize, // how many to skip to go to next page
      orderBy: {
        createdAt: "desc",
      },
    }),
    // counts how many total records match where clause
    prisma.lead.count({ where }),
  ]);

  return {
    leads,
    pagination: buildPagination(total, params.page, params.pageSize),
  };
}

export async function dbGetLeadById(id: string): Promise<LeadDetail | null> {
  return prisma.lead.findUnique({
    where: { id },
    select: leadDetailSelect,
  });
}


// fetch an agent to assign a lead
export async function dbFindAssignableAgentById(
  id: string,
): Promise<LeadAssigneeSummary | null> {
  return prisma.profile.findFirst({
    where: {
      id,
      role: Role.AGENT,
      isActive: true,
    },
    select: assigneeSelect,
  });
}


// Optional transaction support (tx), If no transaction → use the regular Prisma client
export async function dbCreateLead(
  profile: Profile,
  data: CreateLeadRequest,
  tx?: Prisma.TransactionClient,
) {
  const client = tx ?? prisma;
  const lead = await client.lead.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email,
    },
  });

  return lead;
}

export async function dbUpdateLead(
  id: string,
  data: EditLeadRequest,
  tx?: Prisma.TransactionClient,
) {
  const client = tx ?? prisma;
  const updatedLead = await client.lead.update({
    where: { id },
    data,
    select: leadDetailSelect,
  });

  return updatedLead;
}
