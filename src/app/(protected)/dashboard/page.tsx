import { authenticateUser } from "@/utils/authenticateUser";
import { DashboardPageClient } from "@/components/dashboard/dashboard-page-client";

const DashboardPage = async () => {
  const profile = await authenticateUser();

  return <DashboardPageClient role={profile.role} />;

}

export default DashboardPage;