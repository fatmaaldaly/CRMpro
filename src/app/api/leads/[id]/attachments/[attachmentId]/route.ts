// import { AttachmentService } from "@/services/attachments";
// import { authenticateUser } from "@/utils/authenticateUser";
// import { handleRouteError } from "@/utils/handleRouteError";
// import { NextRequest, NextResponse } from "next/server";


// export async function DELETE(req: NextRequest,
//     { params }: { params: { id: string, attachmentId: string } },
// ) {

//     try{
//        const profile = await authenticateUser();
//        const { id: leadId, attachmentId } = params;
//        await AttachmentService.deleteForLead(
//     {    attachmentId,
//         leadId,
//         profile,}
//        );

//        return NextResponse.json ({success: true}, {status: 200});


//     }catch(error){
//         return handleRouteError(error);

//     }
    
// }



import { AttachmentService } from "@/services/attachments";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; attachmentId: string }> },
) {
  try {
    const profile = await authenticateUser();
    const { id: leadId, attachmentId } = await params;

    const result = await AttachmentService.deleteForLead(
      attachmentId,
      leadId,
      profile,
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleRouteError(error);
  }
}