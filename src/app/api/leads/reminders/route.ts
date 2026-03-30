import { listLeadReminders } from "@/services/reminder/service";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";
import { leadIdParamsSchema } from "@/services/lead/schema";



export async function GET(request: NextRequest, 
    { params }: { params: Promise<{ id: string }> }) {

  try{
    const profile = await authenticateUser();
    const {id} = leadIdParamsSchema.parse(await params); 
    const reminder = await listLeadReminders({
        leadId: id,
        page: 1,
        pageSize: 10,
      }, { id: profile.id, role: profile.role
    });

  
  return NextResponse.json({ success: true, data: reminder });
  }catch(error){
    console.error("Error fetching reminders", error);
    return handleRouteError(error);
  }
};