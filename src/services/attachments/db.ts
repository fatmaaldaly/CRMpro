import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function dbListAttachmentsForLead(leadId: string) {
  return prisma.attachment.findMany({
    where: { leadId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fileName: true,
      mimeType: true,
      sizeBytes: true,
      storagePath: true,
      createdAt: true,
      uploadedBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function dbFindAttachmentById(id: string) {
  return prisma.attachment.findUnique({
    where: { id },
    select: {
      id: true,
      fileName: true,
      mimeType: true,
      sizeBytes: true,
      storagePath: true,
      createdAt: true,
      uploadedBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export function dbGetLeadById(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    select: {
      id: true,
    },
  });
}

export function dbCreateAttachment(
  input: {
    leadId: string;
    uploadedById: string;
    fileName: string;
    storagePath: string;
    mimeType: string;
    sizeBytes: number;
  },
  tx?: Prisma.TransactionClient,
) {
  const client = tx ?? prisma;
  return client.attachment.create({
    data: input,
    select: {
      id: true,
    },
  });
}