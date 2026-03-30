import { UserSnapshot } from "@/utils/types/user";
import { CreateReminderRequest, ListLeadRemindersRequest, ListMyRemindersRequest, UpdateReminderRequest} from "./schema";
import {
  dbCreateReminder,
  dbGetLeadAssignedTo,
  dbGetReminder,
  dbUpdateReminderQstashMessageId,
  dbUpdateReminderStatus,
  dbGetLeadReminders,
  dbGetReminderById,
  dbUpdateReminder,
} from "./db";
import { qstash, reminderCallbackUrl } from "@/lib/qstash";
import { prisma } from "@/lib/prisma";
import { validateLeadAccess } from "./helpers";
import { redis } from "@/lib/redis";
import { NotificationService } from "../notification";
import { buildPagination } from "@/utils/pagination";
import { Role, Prisma } from "@/generated/prisma/client";


export const createReminder = async (
  request: CreateReminderRequest,
  userSnapshot: UserSnapshot,
) => {
  // assignedTo is either from body or the requesting user
  const assignedToId = request.assignedToId ?? userSnapshot.id;

  // Validate assignedTo has access to the lead
  const leadAssignedTo = await dbGetLeadAssignedTo(request.leadId);
  if (!validateLeadAccess(leadAssignedTo?.assignedToId, userSnapshot)) {
    throw new Error(
      "You are not authorized to create a reminder for this lead",
    );
  }

  // In a transaction
  const reminder = await prisma.$transaction(async (tx) => {
    // Create reminder
    const reminder = await dbCreateReminder({ ...request, assignedToId }, tx);
    const notBefore = reminder.dueAt.getTime();
    console.log("notBefore", notBefore);

    // Schedule reminder
    const publishResult = await qstash.publishJSON({
      url: reminderCallbackUrl,
      body: { reminderId: reminder.id },
      notBefore: notBefore / 1000,
    });

    console.log("publishResult", publishResult);

    // Update db reminder with qstash message id
    await dbUpdateReminderQstashMessageId(
      reminder.id,
      publishResult.messageId,
      tx,
    );

    return reminder;
  });

  return reminder;
};

export const fireReminder = async (reminderId: string) => {
  const idempotencyKey = `reminder:fired:${reminderId}`;
  const alreadyProcessed = await redis.get(idempotencyKey);

  if (alreadyProcessed)
    return {
      status: "duplicate" as const,
    };

  const reminder = await dbGetReminder(reminderId);
  if (!reminder) {
    await redis.set(idempotencyKey, "missing");
    await redis.expire(idempotencyKey, 60 * 60 * 24);
    return {
      status: "missing" as const,
    };
  }

  // Set idemopency key
  await redis.set(idempotencyKey, "processed");
  await redis.expire(idempotencyKey, 60 * 60 * 24);

  await prisma.$transaction(async (tx) => {
    // Update reminder status to DUE
    await dbUpdateReminderStatus(reminderId, "FIRED", tx);

    // Create notification
    await NotificationService.create(
      {
        title: reminder.title,
        body: `Reminder for lead ${reminder.lead.name}. Note: ${reminder.note}`,
        recipientId: reminder.assignedToId,
        leadId: reminder.leadId,
      },
      { id: reminder.assignedTo.id, role: reminder.assignedTo.role },
      tx,
    );
  });

  return {
    status: "success" as const,
  };
};

export const listLeadReminders = async (
  request: ListLeadRemindersRequest,
  userSnapshot: UserSnapshot,
) => {
  const where: Prisma.ReminderWhereInput = {
    leadId: request.leadId,
  };

  if (userSnapshot.role === Role.AGENT) {
    where.assignedToId = userSnapshot.id;
  }

  if (request.status) {
    where.status = request.status;
  }

  const result = await dbGetLeadReminders(where, {
    page: request.page,
    pageSize: request.pageSize,
  });

  return {
    reminders: result.reminders,
    pagination: buildPagination(result.total, request.page, request.pageSize),
  };
};

export const listMyReminders = async (
  request: ListMyRemindersRequest,
  userSnapshot: UserSnapshot,
) => {
  const where: Prisma.ReminderWhereInput = {};

  if (userSnapshot.role === Role.AGENT) {
    where.assignedToId = userSnapshot.id;
  } else if (request.assignedToId) {
    // Managers/admins can optionally filter by specific agent
    where.assignedToId = request.assignedToId;
  }

  if (request.status) {
    where.status = request.status;
  }

  const result = await dbGetLeadReminders(where, {
    page: request.page,
    pageSize: request.pageSize,
  });

  return {
    reminders: result.reminders,
    pagination: buildPagination(result.total, request.page, request.pageSize),
  };
};

export const cancelReminder = async (
  reminderId: string,
  userSnapshot: UserSnapshot,
) => {
  const reminder = await dbGetReminderById(reminderId);
  if (!reminder) {
    throw new Error("Reminder not found");
  }

  if (reminder.status !== "PENDING") {
    throw new Error("Only pending reminders can be cancelled");
  }

  if (!validateLeadAccess(reminder.assignedToId, userSnapshot)) {
    throw new Error("You are not authorized to cancel this reminder");
  }

  // Cancel the QStash message if it exists
  if (reminder.qstashMessageId) {
    try {
      await qstash.messages.delete(reminder.qstashMessageId);
    } catch {
      // QStash message may have already been delivered or expired
    }
  }

  return dbUpdateReminderStatus(reminderId, "CANCELLED");
};


export const updateReminder = async (
  id: string,
  request: UpdateReminderRequest,
  user: UserSnapshot
) => {
  // 1. Get reminder
  const reminder = await dbGetReminderById(id);
  if (!reminder) throw new Error("Reminder not found");

  // 2. Authorization
  const canAccess =
    reminder.assignedToId === user.id ||
    user.role === "MANAGER" ||
    user.role === "ADMIN";

  if (!canAccess) {
    throw new Error("Not authorized");
  }

  // 3. Allow updating status to CANCELLED or FIRED
  if (request.status === "CANCELLED" || request.status === "FIRED") {
    // 4. Cancel scheduled QStash job if pending
    if (reminder.qstashMessageId) {
      try {
        await qstash.messages.delete(reminder.qstashMessageId);
      } catch {
        // already delivered, expired, etc.
      }
    }

    // 5. Update DB
    return dbUpdateReminder(id, {
      status: request.status,
    });
  }

  throw new Error("Invalid status update");
};