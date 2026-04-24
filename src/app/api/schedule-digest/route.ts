// /api/schedule-digest/route.ts
import { scheduleDigest } from "@/services/manager/service";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await scheduleDigest();
  return NextResponse.json(result);
}