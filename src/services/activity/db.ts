import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { CreateAIActivityRequest } from "./schema";


export async function dbCreateActivities(
  activities: Prisma.ActivityCreateManyInput[],
  tx?: Prisma.TransactionClient,
) {
  const client = tx ?? prisma;
  const created = await client.activity.createMany({
    data: activities,
  });

  return created;
}

export async function dbGetLeadActivities(
  where: Prisma.ActivityWhereInput,
  params: {
    page: number;
    pageSize: number;
  },
) {
  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        content: true,
        type: true,
        createdAt: true,
        id: true,
        actor: {
          select: {
            name: true,
          },
        },
      },
      take: params.pageSize,
      skip: (params.page - 1) * params.pageSize,
    }),
    prisma.activity.count({ where }),
  ]);

  return {
    activities,
    total,
  };
}


export async function dbCreateAIActivity(data: CreateAIActivityRequest) {
  const activity = await prisma.activity.create({
    data,
  });

  return activity;
}