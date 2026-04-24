import { DigestService } from "@/services/digest";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextResponse } from "next/server";


export async function POST() {
  
  try {
    const result = await DigestService.fireDigest();
    
    return NextResponse.json({ success: true, data: result });
  
  } catch (error) {
    return handleRouteError(error);
  }
}