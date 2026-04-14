import {
  deleteLeadAttachment,
  getLeadAttachmentSignedUrl,
  uploadLeadAttachment,
} from "@/lib/supabase/storage";
import {
  dbCreateAttachment,
  dbGetLeadById,
  dbListAttachmentsForLead,
} from "./db";
import {
  ALLOWED_MIME_TYPES,
  AttachmentListItem,
  MAX_FILE_SIZE_BYTES,
} from "./schema";
import { UserSnapshot } from "@/utils/types/user";
import { buildStoragePath } from "./helpers";
import { prisma } from "@/lib/prisma";
import { ActivityService } from "../activity";
import { ActivityType } from "@/generated/prisma/enums";

// Custom error class for attachment operations.
export class AttachmentServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "AttachmentServiceError";
  }
}

// ------------------------------------------------------------------
// LIST FOR LEAD
// ------------------------------------------------------------------
/**
 * List every attachment for a lead, with a fresh signed download
 * URL on each row. URLs are regenerated on every call.
 */
export async function listForLead(
  leadId: string,
): Promise<AttachmentListItem[]> {
  const rows = await dbListAttachmentsForLead(leadId);

  // Generate signed URLs in parallel. One slow URL doesn't block
  // the others.
  return Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      fileName: row.fileName,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      createdAt: row.createdAt,
      uploadedBy: row.uploadedBy,
      downloadUrl: await getLeadAttachmentSignedUrl(row.storagePath),
    })),
  );
}

export async function uploadForLead(input: {
  leadId: string;
  file: File;
  userSnapshot: UserSnapshot;
}) {
  const { leadId, file, userSnapshot } = input;

  // Validate file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new AttachmentServiceError(
      `File size exceeds maximum allowed size of ${MAX_FILE_SIZE_BYTES} bytes`,
      400,
    );
  }

  // Validate file type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new AttachmentServiceError(
      `File type ${file.type} is not allowed. Allowed types are: ${ALLOWED_MIME_TYPES.join(", ")}`,
      400,
    );
  }

  // Validate lead exists
  const lead = await dbGetLeadById(leadId);
  if (!lead) {
    throw new AttachmentServiceError("Lead not found", 404);
  }

  // Upload file
  const storagePath = buildStoragePath(lead.id, file.name);
  await uploadLeadAttachment(storagePath, file);

  try {
    // Create database record
    const attachment = await prisma.$transaction(async (tx) => {
      const attachment = await dbCreateAttachment(
        {
          leadId,
          uploadedById: userSnapshot.id,
          fileName: file.name,
          storagePath,
          mimeType: file.type,
          sizeBytes: file.size,
        },
        tx,
      );

      await ActivityService.create([
        {
          actorId: userSnapshot.id,
          leadId,
          type: ActivityType.ATTACHMENT_ADDED,
          meta: {fileName: file.name},
        },
      ]);

      return attachment;
    });

    return attachment;
  } catch (error) {
    console.error(error);
    await deleteLeadAttachment(storagePath);
    throw new AttachmentServiceError("Failed to upload attachment", 500);
  }
}