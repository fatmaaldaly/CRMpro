import { LeadDetailClient } from "@/components/leads/lead-detail-client";
import { authenticateUser } from "@/utils/authenticateUser";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await authenticateUser();
  const { id } = await params;

  return <LeadDetailClient id={id} role={profile.role} />;
}
