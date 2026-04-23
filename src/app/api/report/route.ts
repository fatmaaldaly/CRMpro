import { Role } from "@/generated/prisma/enums";
import { DashboardService } from "@/services/dashboard";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextResponse } from "next/server";


export async function GET () {
    try{
        const profile = await authenticateUser([Role.MANAGER]);
        const managerReport = await DashboardService.getManagerReport(profile);
        return NextResponse.json({success: true, data: managerReport});
    
    }catch(error){
        return handleRouteError(error);
    }
    
}