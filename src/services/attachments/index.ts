import { uploadAttachmentSchema } from "./schema";
import { deleteForLead, listForLead, uploadForLead } from "./service";
export type { AttachmentListItem } from "./schema";

export const AttachmentService = {
  listForLead: listForLead,
  uploadForLead: uploadForLead,
  deleteForLead: deleteForLead,
} as const;

export const AttachmentSchema = {
  uploadForLead: uploadAttachmentSchema,
} as const;