import { DigestService } from "@/services/digest/index";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextResponse } from "next/server";


export async function GET() {
  
  try{
    const result = await DigestService.scheduleDigest();
    
    return NextResponse.json({success: true, data: result});
    
  }catch(error){
    return handleRouteError(error);
  }
  
}