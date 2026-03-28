import { LeadDetailClient } from "@/components/leads/lead-detail-client";
import { Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { authenticateUser } from "@/utils/authenticateUser";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await authenticateUser();
  const { id } = await params;

  const users = await prisma.profile.findMany({
    where: {
      role: Role.AGENT,
      
    }

  })

  return <LeadDetailClient id={id} role={profile.role} users={users} />;
}
