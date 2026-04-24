import { generateText, Output } from "ai";
import { buildDigestEmail, buildManagerDigestPrompt, calculateConversionRate } from "./helpers";
import {
  dbGetAgentPerformance,
  dbGetLeadsByStage,
  dbGetStuckLeads,
  dbGetTotalLeads,
  dbGetManagers,
  dbGetWonLeads,
  dbCreateDigest,
  dbUpdateDigestStatus,
} from "./db";
import { resend } from "@/lib/resend";
import { ManagerDigestRequest, ManagerDigestSchema } from "./schema";
import { qstash } from "@/lib/qstash";
import { redis } from "@/lib/redis";
import { DigestStatus } from "@/generated/prisma/enums";


export async function generateManagerDigest() {
  const [
    totalLeads,
    wonLeads,
    leadsByStage,
    stuckLeads,
    agentPerformance,
  ] = await Promise.all([
    dbGetTotalLeads(),
    dbGetWonLeads(),
    dbGetLeadsByStage(),
    dbGetStuckLeads(3),
    dbGetAgentPerformance(),
  ]);

  const conversionRate = calculateConversionRate(wonLeads, totalLeads);

  const input = {
    totalLeads,
    wonLeads,
    conversionRate,
    leadsByStage,
    stuckLeads,
    agentPerformance,
  };

  const prompt = buildManagerDigestPrompt(input);

  const { output } = await generateText({
    
    model: "deepseek/deepseek-v3.2-thinking",
    output: Output.object({ schema: ManagerDigestSchema }),
    prompt,
  });  

 return output;
}


export async function sendDigestEmail(digest: ManagerDigestRequest) {
  const managers = await dbGetManagers();
  if (managers.length === 0) return;

  for (const manager of managers) {
    await resend.emails.send({
      from: "onboarding@resend.dev", 
      to: "fatimaaldaly05@gmail.com", // to: manager.email,
      subject: `Daily CRM Digest - ${new Date().toDateString()}`,
      html: buildDigestEmail(digest, manager.name),
    });
  }
}


export async function scheduleDigest() {
  // this is just a name (identifier) stored in Redis
  const key = "digest:schedule:daily";
  const exists = await redis.get(key);
  if (exists) {
    return { status: "already-scheduled" };
  }
  // create the schedule if not vreated before
  const result = await qstash.schedules.create({
    destination: `${process.env.NEXT_PUBLIC_API_URL}/api/digest`,
    cron: "0 8 * * *", // minute hour day month weekday
  });

  // Store that scheduling happened
  // Saves the scheduleId (or "1" if missing)
  // "EX", 60 * 60 * 24 * 7: Add expiration, key stays up to 7 days
  await redis.set(key, result.scheduleId ?? "1", "EX", 60 * 60 * 24 * 7);
  return result;
}


export const fireDigest = async () => {
  const key = "digest:manager:daily";

  // prevent duplicate execution
  // "EX", 60 * 60 * 2 → expires in 2 hours
  // "NX" → Only set the key if it does NOT exist
  // If no one is running → key is set → locked = true
  // If already running → key exists → locked = null
  const locked = await redis.set(
    key,"processing", "EX", 60 * 60 * 2, "NX");
  
  // if already running stps execution immediately
  if (!locked) {
    return { status: "duplicate" };
  }

  // 1. generate AI digest 
  const digest = await generateManagerDigest();

  // 2. save digest in DB
  const digestRecord = await dbCreateDigest(digest);

  try {
  
    // 3. send email
    await sendDigestEmail(digest);

    // 4. update DB
    await dbUpdateDigestStatus(
      digestRecord.id,
      DigestStatus.SENT,
      new Date()
    );

    // 5. mark success
    await redis.set(key, "completed", "EX", 60 * 60 * 24);

    return { status: "success" };
  } catch (error) {
    await dbUpdateDigestStatus(
      digestRecord.id,
      DigestStatus.FAILED,
      new Date()
    );

    // Allows retry later, prevents system from getting stuck
    await redis.del(key);
    throw error;
  }
};