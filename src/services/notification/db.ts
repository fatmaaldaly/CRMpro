import { prisma } from "@/lib/prisma";
import {
  CreateNotificationRequest,
  ListNotificationsParams,
  ListNotificationsResponseData,
  NotificationListItem,
} from "./schema";
import { NotificationReadState, Prisma } from "@/generated/prisma/client";
import { buildPagination } from "@/utils/pagination";

const notificationListSelect = {
  id: true,
  title: true,
  body: true,
  leadId: true,
  readState: true,
  readAt: true,
  createdAt: true,
  lead: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.NotificationSelect;

export const dbCreateNotification = async (
  request: CreateNotificationRequest,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx ?? prisma;
  const notification = await client.notification.create({
    data: {
      ...request,
    },
  });

  return notification;
};

export const dbListNotificationsForRecipient = async (
  recipientId: string,
  params: ListNotificationsParams,
): Promise<ListNotificationsResponseData> => {
  const where: Prisma.NotificationWhereInput = { recipientId };
  const whereUnread: Prisma.NotificationWhereInput = {
    recipientId,
    readState: NotificationReadState.UNREAD,
  };

  const [rows, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      select: notificationListSelect,
      take: params.pageSize,
      skip: (params.page - 1) * params.pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: whereUnread }),
  ]);

  return {
    notifications: rows,
    pagination: buildPagination(total, params.page, params.pageSize),
    unreadCount,
  };
};

export const dbMarkNotificationReadForRecipient = async (
  id: string,
  recipientId: string,
): Promise<NotificationListItem | null> => {
  const existing = await prisma.notification.findFirst({
    where: { id, recipientId },
    select: { id: true },
  });

  if (!existing) {
    return null;
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: {
      readState: NotificationReadState.READ,
      readAt: new Date(),
    },
    select: notificationListSelect,
  });

  return updated;
};

export const dbGetLeadAssignedTo = async (leadId: string) => {
  return prisma.lead.findUnique({
    where: { id: leadId },
    select: {
      assignedToId: true,
    },
  });
};