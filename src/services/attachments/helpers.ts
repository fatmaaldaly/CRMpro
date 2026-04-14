export function buildStoragePath(leadId: string, fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${leadId}/${Date.now()}-${safeName}`;
}