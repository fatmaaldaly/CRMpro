import { prisma } from "@/lib/prisma";
import {
  ActivityType,
  LeadStage,
  LeadStatus,
  ReminderStatus,
} from "@/generated/prisma/client";
import { addDays, subDays, subHours } from "date-fns";

/**
 * Run after agents exist (e.g. `npx tsx prisma/seed/seed-agents.ts` or full seed).
 * Usage: `npx tsx prisma/seed/seed-leads.ts`
 */
const main = async () => {
  const agents = await prisma.profile.findMany({
    where: { role: "AGENT" },
    orderBy: { createdAt: "asc" },
  });

  if (agents.length === 0) {
    throw new Error(
      "No AGENT profiles found. Seed agents first (e.g. prisma/seed/seed-agents.ts).",
    );
  }

  const a = (i: number) => agents[i % agents.length]!.id;

  const now = new Date();

  type ActivityRow = {
    at: Date;
    actorIndex: number;
    type: ActivityType;
    content: string | null;
  };

  const leads: Array<{
    name: string;
    phone: string;
    email: string;
    stage: LeadStage;
    status: LeadStatus;
    assignedIndex: number;
    createdAt: Date;
    activities: ActivityRow[];
    reminders?: Array<{
      assignedIndex: number;
      title: string;
      note: string | null;
      dueAt: Date;
      status: ReminderStatus;
    }>;
  }> = [
    {
      name: "Northwind Trading Co.",
      phone: "+14155550172",
      email: "sarah.chen@northwind.example",
      stage: "NEGOTIATING",
      status: "OPEN",
      assignedIndex: 0,
      createdAt: subDays(now, 24),
      activities: [
        {
          at: subDays(now, 24),
          actorIndex: 0,
          type: "LEAD_CREATED",
          content: "Inbound demo request from website pricing page.",
        },
        {
          at: subDays(now, 23),
          actorIndex: 0,
          type: "NOTE",
          content:
            "Company: mid-market wholesale. ~45 employees. Currently on spreadsheets + legacy CRM.",
        },
        {
          at: subDays(now, 22),
          actorIndex: 0,
          type: "CALL_ATTEMPT",
          content:
            "Outbound — connected 12m. Pain: pipeline visibility, manager reporting. Budget Q2.",
        },
        {
          at: subDays(now, 21),
          actorIndex: 0,
          type: "STAGE_CHANGE",
          content: "Stage moved from NEW to CONTACTED after discovery.",
        },
        {
          at: subDays(now, 19),
          actorIndex: 0,
          type: "NOTE",
          content:
            "Champion: Sarah Chen (Ops). Economic buyer: CFO — wants ROI sheet before pilot.",
        },
        {
          at: subDays(now, 17),
          actorIndex: 0,
          type: "CALL_ATTEMPT",
          content:
            "Follow-up — 20m. Sent one-pager and sample weekly digest report.",
        },
        {
          at: subDays(now, 16),
          actorIndex: 0,
          type: "STAGE_CHANGE",
          content: "Stage moved from CONTACTED to QUALIFIED (BANT confirmed).",
        },
        {
          at: subDays(now, 14),
          actorIndex: 1,
          type: "ASSIGNMENT_CHANGE",
          content:
            "Reassigned from Agent 1 to Agent 2 for territory alignment (West region).",
        },
        {
          at: subDays(now, 13),
          actorIndex: 1,
          type: "CALL_ATTEMPT",
          content:
            "Technical deep-dive with IT — SSO + SCIM requirements captured.",
        },
        {
          at: subDays(now, 12),
          actorIndex: 1,
          type: "REMINDER_CREATED",
          content: "Reminder set: send security questionnaire before legal review.",
        },
        {
          at: subDays(now, 11),
          actorIndex: 1,
          type: "NOTE",
          content: "Competitor: evaluating Salesforce + HubSpot. We lead on ease of rollout.",
        },
        {
          at: subDays(now, 9),
          actorIndex: 1,
          type: "STATUS_CHANGE",
          content: "Status reviewed — still OPEN; deal in security review.",
        },
        {
          at: subDays(now, 8),
          actorIndex: 1,
          type: "CALL_ATTEMPT",
          content:
            "Negotiation call — 35m. Discussed annual vs monthly; asked for 15% discount.",
        },
        {
          at: subDays(now, 7),
          actorIndex: 1,
          type: "STAGE_CHANGE",
          content: "Stage moved from QUALIFIED to NEGOTIATING (proposal out).",
        },
        {
          at: subDays(now, 5),
          actorIndex: 1,
          type: "NOTE",
          content:
            "Proposal v2 sent: 50 seats, onboarding bundle, quarterly business review included.",
        },
        {
          at: subDays(now, 3),
          actorIndex: 1,
          type: "CALL_ATTEMPT",
          content:
            "Check-in — no response yet; CFO reviewing with legal (expected this week).",
        },
        {
          at: subDays(now, 2),
          actorIndex: 1,
          type: "ATTACHMENT_ADDED",
          content: "Uploaded redlined MSA from their counsel (v3).",
        },
        {
          at: subHours(subDays(now, 1), 2),
          actorIndex: 1,
          type: "NOTE",
          content:
            "Internal: escalate if no reply by Friday — consider executive sponsor email.",
        },
        {
          at: subHours(now, 3),
          actorIndex: 1,
          type: "AI_LEAD_BRIEF_GENERATED",
          content: "AI brief refreshed before QBR prep.",
        },
      ],
      reminders: [
        {
          assignedIndex: 1,
          title: "Send revised ROI with seat ramp",
          note: "CFO asked for 24-month TCO vs status quo.",
          dueAt: addDays(now, 2),
          status: "PENDING",
        },
        {
          assignedIndex: 1,
          title: "Follow up on MSA redlines",
          note: "Confirm liability cap language acceptable.",
          dueAt: addDays(now, 5),
          status: "PENDING",
        },
        {
          assignedIndex: 0,
          title: "Quarterly pipeline review",
          note: "Completed sync with manager.",
          dueAt: subDays(now, 1),
          status: "COMPLETED",
        },
      ],
    },
    {
      name: "Harborline Dental Group",
      phone: "+16505550988",
      email: "frontdesk@harborline.example",
      stage: "QUALIFIED",
      status: "OPEN",
      assignedIndex: 2,
      createdAt: subDays(now, 18),
      activities: [
        {
          at: subDays(now, 18),
          actorIndex: 2,
          type: "LEAD_CREATED",
          content: "Referral from existing customer (Summit Clinics).",
        },
        {
          at: subDays(now, 17),
          actorIndex: 2,
          type: "CALL_ATTEMPT",
          content: "First call — 8m. Office manager interested in reminders + SMS.",
        },
        {
          at: subDays(now, 15),
          actorIndex: 2,
          type: "STAGE_CHANGE",
          content: "NEW → CONTACTED.",
        },
        {
          at: subDays(now, 12),
          actorIndex: 2,
          type: "NOTE",
          content: "HIPAA considerations — need BAA path; scheduling compliance review.",
        },
        {
          at: subDays(now, 10),
          actorIndex: 2,
          type: "CALL_ATTEMPT",
          content: "Demo scheduled for next Tuesday (calendar invite sent).",
        },
        {
          at: subDays(now, 8),
          actorIndex: 2,
          type: "STAGE_CHANGE",
          content: "CONTACTED → QUALIFIED after demo; pilot proposed for 2 locations.",
        },
        {
          at: subDays(now, 6),
          actorIndex: 2,
          type: "REMINDER_CREATED",
          content: "Reminder: send pilot checklist and implementation timeline.",
        },
        {
          at: subDays(now, 4),
          actorIndex: 2,
          type: "NOTE",
          content: "Waiting on practice owner sign-off; office manager is champion.",
        },
        {
          at: subDays(now, 2),
          actorIndex: 2,
          type: "AI_FOLLOWUP_DRAFT_GENERATED",
          content: "Draft follow-up email after demo (not sent yet).",
        },
      ],
      reminders: [
        {
          assignedIndex: 2,
          title: "Pilot scope confirmation call",
          note: "Lock locations + go-live window.",
          dueAt: addDays(now, 3),
          status: "PENDING",
        },
      ],
    },
    {
      name: "Redwood Fitness",
      phone: "+12065550104",
      email: "owner@redwoodfitness.example",
      stage: "CONTACTED",
      status: "OPEN",
      assignedIndex: 0,
      createdAt: subDays(now, 9),
      activities: [
        {
          at: subDays(now, 9),
          actorIndex: 0,
          type: "LEAD_CREATED",
          content: "Cold outreach — LinkedIn campaign.",
        },
        {
          at: subDays(now, 8),
          actorIndex: 0,
          type: "CALL_ATTEMPT",
          content: "No answer; left VM with value prop.",
        },
        {
          at: subDays(now, 7),
          actorIndex: 0,
          type: "CALL_ATTEMPT",
          content: "Connected — owner busy; callback Thursday.",
        },
        {
          at: subDays(now, 5),
          actorIndex: 0,
          type: "STAGE_CHANGE",
          content: "NEW → CONTACTED.",
        },
        {
          at: subDays(now, 4),
          actorIndex: 0,
          type: "NOTE",
          content: "Single location gym; price sensitive. Wants mobile-first.",
        },
      ],
    },
    {
      name: "Lumen Analytics",
      phone: "+13125550419",
      email: "procurement@lumen.example",
      stage: "QUALIFIED",
      status: "WON",
      assignedIndex: 3,
      createdAt: subDays(now, 30),
      activities: [
        {
          at: subDays(now, 30),
          actorIndex: 3,
          type: "LEAD_CREATED",
          content: "RFP response submitted via portal.",
        },
        {
          at: subDays(now, 28),
          actorIndex: 3,
          type: "CALL_ATTEMPT",
          content: "Intake call — 25m. Requirements doc received.",
        },
        {
          at: subDays(now, 25),
          actorIndex: 3,
          type: "STAGE_CHANGE",
          content: "Moved to QUALIFIED after scoring.",
        },
        {
          at: subDays(now, 20),
          actorIndex: 3,
          type: "NOTE",
          content: "Security questionnaire completed; passed review.",
        },
        {
          at: subDays(now, 14),
          actorIndex: 3,
          type: "CALL_ATTEMPT",
          content: "Final pricing alignment with procurement.",
        },
        {
          at: subDays(now, 10),
          actorIndex: 3,
          type: "STAGE_CHANGE",
          content: "NEGOTIATING — contract in final review.",
        },
        {
          at: subDays(now, 7),
          actorIndex: 3,
          type: "STATUS_CHANGE",
          content: "Deal signed — status WON. Kickoff next week.",
        },
      ],
    },
    {
      name: "Copper Mill Coffee",
      phone: "+15035550771",
      email: "ops@coppermill.example",
      stage: "CONTACTED",
      status: "LOST",
      assignedIndex: 4,
      createdAt: subDays(now, 14),
      activities: [
        {
          at: subDays(now, 14),
          actorIndex: 4,
          type: "LEAD_CREATED",
          content: "Web form — interested in team plan.",
        },
        {
          at: subDays(now, 13),
          actorIndex: 4,
          type: "CALL_ATTEMPT",
          content: "Discovery — 15m. Three cafes, need basic pipeline.",
        },
        {
          at: subDays(now, 11),
          actorIndex: 4,
          type: "NOTE",
          content: "Evaluating cheaper alternative; decision end of month.",
        },
        {
          at: subDays(now, 8),
          actorIndex: 4,
          type: "CALL_ATTEMPT",
          content: "Follow-up — competitor offered bundled POS discount.",
        },
        {
          at: subDays(now, 5),
          actorIndex: 4,
          type: "STATUS_CHANGE",
          content: "Lost — went with competitor on price. Leave door open for Q3.",
        },
      ],
    },
  ];

  let created = 0;

  for (const spec of leads) {
    const assignedId = a(spec.assignedIndex);

    await prisma.$transaction(async (tx) => {
      const lead = await tx.lead.create({
        data: {
          name: spec.name,
          phone: spec.phone,
          email: spec.email,
          stage: spec.stage,
          status: spec.status,
          assignedToId: assignedId,
          createdAt: spec.createdAt,
          activities: {
            create: spec.activities.map((row) => ({
              actorId: a(row.actorIndex),
              type: row.type,
              content: row.content,
              createdAt: row.at,
            })),
          },
        },
        include: { activities: true },
      });

      if (spec.reminders?.length) {
        await tx.reminder.createMany({
          data: spec.reminders.map((r) => ({
            leadId: lead.id,
            assignedToId: a(r.assignedIndex),
            title: r.title,
            note: r.note,
            dueAt: r.dueAt,
            status: r.status,
          })),
        });
      }
    });

    created += 1;
  }

  console.log(`Seeded ${created} leads with activities (and reminders where defined).`);
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });