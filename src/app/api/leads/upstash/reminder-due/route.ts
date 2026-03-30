import { verifyQstashSignature } from "@/lib/qstash";
import { ReminderSchema, ReminderService } from "@/services/reminder";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    const isValid = await verifyQstashSignature(request, rawBody);
    if (!isValid)
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

    const body = ReminderSchema.qstash.parse(JSON.parse(rawBody));
    console.log("body", body);

    const reminder = await ReminderService.fire(body.reminderId);
    console.log("reminder", reminder);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error occured while firing reminder", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}