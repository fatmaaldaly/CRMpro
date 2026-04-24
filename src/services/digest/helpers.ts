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
${leadsByStage.map(l => `${l.stage}: ${l.count}`).join("\n")}

=== STUCK LEADS (not updated recently) ===
${stuckLeads.length 
  ? stuckLeads.map(s => `${s.stage}: ${s.count}`).join("\n")
  : "No stuck leads"}

=== AGENT PERFORMANCE ===
${agentPerformance.map(agent => {
  const total = agent.leads.length;
  const won = agent.leads.filter(l => l.status === "WON").length;
  const rate = total ? ((won / total) * 100).toFixed(1) : 0;

  return `${agent.name}: ${won}/${total} won (${rate}%)`;
}).join("\n")}

=== TASK ===
Return ONLY:

1. summary (max 2 sentences, must mention key trend or change)
2. insights (2-5 key findings)
3. risks (max 4 risks or issues)
4. recommendations (actionable steps)
5. topPerformers (best agents with reasoning)

Rules:
- Do NOT invent data
- Be concise and actionable
- Avoid generic phrases like "overall performance is good"
- Use numbers when possible
`;
}


export function buildDigestEmail(digest: ManagerDigestRequest, name: string) {
  return `
  <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
    
    <h2> Daily CRM Digest</h2>
    <p>Good morning ${name}, here's your pipeline overview:</p>

    <h3> Summary</h3>
    <p>${digest.summary}</p>

    <h3> Insights</h3>
    <ul>
      ${digest.insights.length 
      ? digest.insights.map(i => `<li>${i}</li>`).join("")
      : "<li>No insights available</li>"}
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