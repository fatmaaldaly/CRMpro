import supabaseAdmin from "./admin";

const LEAD_ATTACHMENTS_BUCKET = "lead-attachments";
const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 HOUR

export async function uploadLeadAttachment(
  storagePath: string,
  file: File,
): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from(LEAD_ATTACHMENTS_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false, // so we don't overwrite the existing file
    });

  if (error) {
    throw new Error(`Failed to upload attachment: ${error.message}`);
  }
}

export async function deleteLeadAttachment(storagePath: string): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from(LEAD_ATTACHMENTS_BUCKET)
    .remove([storagePath]);

  if (error) {
    throw new Error(`Failed to delete attachment: ${error.message}`);
  }
}

export async function getLeadAttachmentSignedUrl(
  storagePath: string,
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(LEAD_ATTACHMENTS_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS); // generate a temp access link

  if (error) {
    throw new Error(`Failed to get signed URL: ${error.message}`);
  }

  return data.signedUrl;
}