import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/utils/authenticateUser';
import { AttachmentService } from '@/services/attachments/index';
import { handleRouteError } from '@/utils/handleRouteError';



export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await authenticateUser();
    const { id } = await params;

    const attachments = await AttachmentService.listForLead(id);
    return NextResponse.json({ success: true, data: attachments });
  } catch (error) {
    return handleRouteError(error);
  }
}


export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await authenticateUser();
    // params is a promise it must be awaited
    const { id } = await params;
    
    // Validate request is multipart/form-data
    if (!req.headers.get("content-type")?.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Invalid request content type" },
        { status: 400 },
      );
    }
    
    // file uploads are multipart/form-data thats why we use formData() not json()
    const formData = await req.formData();
    const file = formData.get("file");
    
    // validate the file exists
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // FULL pipeline: validate file, upload to storage, save DB record, create activity log, cleanup on failure
    const attachment = await AttachmentService.uploadForLead({
      leadId: id,
      file,
      userSnapshot: profile,
    });

    return NextResponse.json({ success: true, data: attachment });
  } catch (error) {
    return handleRouteError(error);
  }
}