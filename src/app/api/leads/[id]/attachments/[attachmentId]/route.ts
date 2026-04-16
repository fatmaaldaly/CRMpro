import { AttachmentService } from "@/services/attachments";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";


export async function DELETE(req: NextRequest,
    { params }: { params: Promise<{ id: string, attachmentId: string }> },
) {

    try{
       const profile = await authenticateUser();
       const {id: leadId} = await params;
       const {attachmentId} = await params;
       await AttachmentService.deleteForLead(
        leadId,
        attachmentId,
        profile,
       );

       return NextResponse.json ({success: true}, {status: 200});


    }catch(error){
        return handleRouteError(error);

    }
    
}