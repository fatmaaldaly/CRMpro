import { Profile, Prisma } from "@/generated/prisma/client";
import { UserSnapshot } from "@/utils/types/user";
import {
  CreateNotificationRequest,
  ListNotificationsParams,
} from "./schema";
import {
  dbCreateNotification,
  dbGetLeadAssignedTo,
  dbListNotificationsForRecipient,
  dbMarkNotificationReadForRecipient,
} from "./db";
import { validateLeadAccess } from "./helpers";

export class NotificationServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "NotificationServiceError";
  }
}

export const createNotification = async (
  request: CreateNotificationRequest,
  userSnapshot: UserSnapshot,
  tx?: Prisma.TransactionClient,
) => {
  if (request.leadId) {
    const lead = await dbGetLeadAssignedTo(request.leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }

    if (!validateLeadAccess(lead.assignedToId, userSnapshot)) {
      throw new Error(
        "You are not authorized to create a notification for this lead",
      );
    }
  }

  const notification = await dbCreateNotification(request, tx);

  return notification;
};

export async function listNotifications(
  profile: Profile,
  params: ListNotificationsParams,
) {
  return dbListNotificationsForRecipient(profile.id, params);
}

export async function markNotificationRead(profile: Profile, id: string) {
  const updated = await dbMarkNotificationReadForRecipient(id, profile.id);

  if (!updated) {
    throw new NotificationServiceError("Notification not found", 404);
  }

  return updated;
}