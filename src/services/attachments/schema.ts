import { z } from "zod";
import type { dbListAttachmentsForLead } from "./db";

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "video/mp4",
  "video/mpeg",
  "video/quicktime",
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const uploadAttachmentSchema = z.object({
  leadId: z.uuid(),
});

export type AttachmentListItem = Omit<
  Awaited<ReturnType<typeof dbListAttachmentsForLead>>[number],
  "storagePath"
> & { downloadUrl: string };