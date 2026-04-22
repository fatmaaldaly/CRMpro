import { 
  dbGetAgentPerformance, 
  dbGetLeadsByStage, 
  dbGetStuckLeads, 
  dbGetTotalLeads, 
  dbGetWonLeads } from "./db";
 import { ManagerDigestRequest } from "./schema"; 


type StuckLeads = Awaited<ReturnType<typeof dbGetStuckLeads>>
type TotalLeads = Awaited<ReturnType<typeof dbGetTotalLeads>>;
type WonLeads = Awaited<ReturnType<typeof dbGetWonLeads>>;
type ConversionRate = Awaited<ReturnType<typeof dbGetWonLeads>>;
type LeadsByStage = Awaited<ReturnType<typeof dbGetLeadsByStage>>;
type AgentPerformance = Awaited<ReturnType<typeof dbGetAgentPerformance>>;


// percent of won leads
export function calculateConversionRate(won: number, total: number) {
  if (total === 0) return 0;
  return (won / total) * 100;
}


// Converts milliseconds to days, because db stores time in milliseconds
export function msToDays(ms: number) {
  return ms / (1000 * 60 * 60 * 24);
}


// AI Prompt (Manager Digest)
export function buildManagerDigestPrompt(args: {
  stuckLeads: StuckLeads,
  totalLeads: TotalLeads,
  wonLeads: WonLeads,
  conversionRate: ConversionRate,
  leadsByStage: LeadsByStage,
  agentPerformance: AgentPerformance,
}
): string {
  const {stuckLeads, totalLeads, wonLeads, 
    conversionRate, leadsByStage, agentPerformance} = args
  return `
You are a CRM analytics assistant for a sales manager.

Analyze the following CRM data and generate a structured report.

=== OVERVIEW ===
Total Leads: ${totalLeads}
Won Leads: ${wonLeads}
Conversion Rate: ${conversionRate}%

=== PIPELINE BY STAGE ===
${JSON.stringify(leadsByStage)}

=== STUCK LEADS ===
${JSON.stringify(stuckLeads)}

=== AGENT PERFORMANCE ===
${JSON.stringify(agentPerformance)}

=== TASK ===
Return ONLY:

1. summary (short overview of situation)
2. insights (2-5 key findings)
3. risks (max 4 risks or issues)
4. recommendations (actionable steps)
5. topPerformers (best agents with reasoning)

Rules:
- Do NOT invent data
- Be concise and actionable
- Focus on business decisions, not generic text
`;
}


export function buildDigestEmail(digest: ManagerDigestRequest, name: string) {
  return `
  <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
    
    <h2> Daily CRM Digest</h2>
    <p>Good morning ${name}, here's your pipeline overview:</p>

    <h3> Insights</h3>
    <ul>
      ${digest.insights.map(i => `<li>${i}</li>`).join("")}
    </ul>

    <h3> Risks</h3>
    <ul>
      ${digest.risks.map(r => `<li>${r}</li>`).join("")}
    </ul>

    <h3> Recommendations</h3>
    <ul>
      ${digest.recommendations.map(r => `<li>${r}</li>`).join("")}
    </ul>

    <h3> Top Performers</h3>
    <ul>
      ${digest.topPerformers
        .map(p => `<li><b>${p.name}</b> — ${p.metric}</li>`)
        .join("")}
    </ul>

    <p style="margin-top: 20px; font-size: 12px; color: gray;">
      Generated automatically by your CRM system
    </p>
  </div>
  `;
}