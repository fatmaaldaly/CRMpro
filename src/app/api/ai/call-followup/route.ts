import { AISchema, AIService } from "@/services/ai";
import { authenticateUser } from "@/utils/authenticateUser";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest){
    try{
      //authenticate
      const profile = await authenticateUser();
      const body = await req.json();
      

      // validate Parse with generateCallFollowUpRequestSchema
      const {leadId} = AISchema.generateCallFollowup.parse(body);

      // call service
    //   const brief = await AIService.generateCallFollowup({
    //   leadId,
    //   callOutCome: body.callOutCome,
    //   agentNotes: body.agentNotes,
    //   actorId: profile.id, 
    // });

    const brief = await AIService.generateCallFollowup({
  leadId,
  callOutCome: body.callOutCome,
  agentNotes: body.agentNotes,
  actorId: profile.id,
  userSnapshot: {
    id: profile.id,
    // name: profile.name,   
    role: profile.role,
  },
});

    return NextResponse.json({success: true, data: brief});
    }catch(error){
        console.error("AI CALL FOLLOWUP ROUTE ERROR:", error);
        return NextResponse.json({success: false, error: (error as Error).message}, {status: 500});
    }
           
    
}