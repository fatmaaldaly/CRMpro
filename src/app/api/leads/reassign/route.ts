import { Role } from "@/generated/prisma/enums";
import { LeadSchema, LeadService } from "@/services/lead";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";


export async function POST (req: NextRequest) {

    try{
        const profile = await authenticateUser([Role.MANAGER, Role.ADMIN]);
        const body = req.json();
        const data = LeadSchema.reassignLeads.parse(body);
        const reassign = await LeadService.reassignLead(profile, data);
        
        return NextResponse.json({success: true, data: reassign});
    
    }catch(error){
      console.error("Error reassigning leads", error);
      return handleRouteError(error);

    }

}