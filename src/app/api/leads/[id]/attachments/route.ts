import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/utils/authenticateUser';
import { AttachmentService } from '@/services/attachments/index';
import { handleRouteError } from '@/utils/handleRouteError';



export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await authenticateUser();
    const { id: leadId } = await params;
    const attachments = await AttachmentService.listForLead(leadId);
    return NextResponse.json({ success: true, data: attachments });
  } catch (error) {
    return handleRouteError(error);
  }

}



export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await authenticateUser();
    // params is a promise it must be awaited
    const { id: leadId } = await params;
    // file uploads are multipart/form-data thats why we use formData() not json()
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    // validate the file exists
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 },
      );
    }

    // FULL pipeline: validate file, upload to storage, save DB record, create activity log, cleanup on failure
    const attachment = await AttachmentService.uploadForLead({
      leadId,
      file,
      userSnapshot: profile,
    });

    return NextResponse.json({ success: true, data: attachment }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}