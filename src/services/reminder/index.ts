import { createReminderSchema, listLeadRemindersSchema, listMyRemindersSchema, qstashReminderDueSchema, updateReminderSchema } from "./schema";
import { createReminder, fireReminder, listLeadReminders, listMyReminders, cancelReminder } from "./service";

export const ReminderService = {
  create: createReminder,
  fire: fireReminder,
  listByLead: listLeadReminders,
  listMy: listMyReminders,
  cancel: cancelReminder,
} as const;

export const ReminderSchema = {
  create: createReminderSchema,
  qstash: qstashReminderDueSchema,
  listByLead: listLeadRemindersSchema,
  listMy: listMyRemindersSchema,
  update: updateReminderSchema,
} as const;