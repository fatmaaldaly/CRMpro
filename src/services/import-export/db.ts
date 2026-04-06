import { Prisma } from "@/generated/prisma/browser";
import { prisma } from "@/lib/prisma";

export async function dbFindProfileByEmail(email: string) {
  return await prisma.profile.findUnique({
    where: { email },
    select: { id: true, isActive: true },
  });
}


export async function dbGetLeadsForExport(where: Prisma.LeadWhereInput) {
  // const where: Prisma.LeadWhereInput =
  //   profile.role === Role.AGENT
  //     ? { assignedToId: profile.id }
  //     : {};

  return await prisma.lead.findMany({
    where,
    select: {
      phone: true,
      name: true,
      email: true,
      assignedTo: { select: { email: true } },
      stage: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}