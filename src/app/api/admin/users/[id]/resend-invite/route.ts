import { AdminService } from "@/services/admin";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@/generated/prisma/client";



export async function POST(request: NextRequest, 
    { params }: { params: Promise<{ id: string }> }) {
  try{
    await authenticateUser([Role.ADMIN]);
    const {id} = await params;
    const resendInvite = await AdminService.user.resendInvite(id);
    return NextResponse.json({success: true, data: resendInvite,});
  
  }catch(err){
    console.error("Error resending invite:", err);
    return handleRouteError(err);
  }
}