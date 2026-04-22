import { generateText, Output } from "ai";
import { buildDigestEmail, buildManagerDigestPrompt, calculateConversionRate } from "./helpers";
import {
  dbGetAgentPerformance,
  dbGetLeadsByStage,
  dbGetStuckLeads,
  dbGetTotalLeads,
  dbGetUserById,
  dbGetWonLeads,
} from "./db";
import { resend } from "@/lib/resend";
import { ManagerDigestRequest, ManagerDigestSchema } from "./schema";


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




export async function sendDigestEmails(digest: ManagerDigestRequest) {
  const managers = await dbGetUserById();

  if (managers.length === 0) return;

  for (const manager of managers) {
    await resend.emails.send({
      from: "onboarding@resend.dev", // change later
      to: "fatimaaldaly05@gmail.com", // to: manager.email,
      subject: `Daily CRM Digest - ${new Date().toDateString()}`,
      html: buildDigestEmail(digest, manager.name),
    });
  }
}


// import { qstash } from "@/lib/qstash";

// export async function scheduleDailyDigest() {
//   await qstash.schedules.create({
//     destination: `${process.env.NEXT_PUBLIC_API_URL}/api/digest`,
//     cron: "20 12 * * *", 
                        
//   });
// }
// minute hour day month weekday
                        // 0     12   *    *     *