import { z } from "zod";
import { ReminderStatus } from "@/generated/prisma/enums";

export const createReminderSchema = z.object({
  title: z.string().min(1),
  note: z.string().optional(),
  dueAt: z.coerce.date().refine((date) => {
    return (
      date.getTime() > new Date().getTime() &&
      date.getTime() < new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).getTime()
    );
  }),
  assignedToId: z.uuid().optional(),
});

export type CreateReminderRequest = z.infer<typeof createReminderSchema> & {
  leadId: string;
};

export const qstashReminderDueSchema = z.object({
  reminderId: z.uuid(),
});

export const listLeadRemindersSchema = z.object({
  leadId: z.uuid(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  status: z.nativeEnum(ReminderStatus).optional(),
});

export type ListLeadRemindersRequest = z.infer<typeof listLeadRemindersSchema>;

export const listMyRemindersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  status: z.nativeEnum(ReminderStatus).optional(),
  assignedToId: z.string().uuid().optional(),
});

export type ListMyRemindersRequest = z.infer<typeof listMyRemindersSchema>;

export const updateReminderSchema = z.object({
  status: z.enum(["CANCELLED", "FIRED"]),
});

export type UpdateReminderRequest = z.infer<typeof updateReminderSchema>;

export const reminderIdSchema = z.object({
  id: z.uuid(),
});

export type ReminderIdRequest = z.infer<typeof reminderIdSchema>;