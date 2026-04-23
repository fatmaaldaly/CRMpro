import { authenticateUser } from "@/utils/authenticateUser";
import { Report } from "@/components/report/Report";


const ManagerPage = async () => {
  const profile = await authenticateUser();

  return <Report role={profile.role}/>;

}

export default ManagerPage;