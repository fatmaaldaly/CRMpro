import { uploadAttachmentSchema } from "./schema";
import { listForLead, uploadForLead } from "./service";
export type { AttachmentListItem } from "./schema";

export const AttachmentService = {
  listForLead: listForLead,
  uploadForLead: uploadForLead,
} as const;

export const AttachmentSchema = {
  uploadForLead: uploadAttachmentSchema,
} as const;