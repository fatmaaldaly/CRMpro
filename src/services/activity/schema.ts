import { ActivityType, LeadStage, LeadStatus } from "@/generated/prisma/enums";
import { PaginationMeta } from "@/utils/pagination";
import { z } from "zod";

const leadStatusSchema = z.enum(LeadStatus);
const leadStageSchema = z.enum(LeadStage);
const createActivitySchema = z
  .object({
    leadId: z.uuid(),
    actorId: z.uuid(),
    type: z.enum(ActivityType),
    // meta: z
    //   .object({
    //     from: z.unknown(),
    //     to: z.unknown(),
    //   })
    //   .optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
  })
  .superRefine((data) => {
    if (
      ["STATUS_CHANGE", "STAGE_CHANGE", "ASSIGNMENT_CHANGE", "NOTE"].includes(data.type)
    ) {
      if (!data.meta) {
        throw new Error("Meta is required for status change");
      }

      switch (data.type) {
        case ActivityType.STATUS_CHANGE:
          data.meta.from = leadStatusSchema.parse(data.meta.from);
          data.meta.to = leadStatusSchema.parse(data.meta.to);
          break;
        case ActivityType.STAGE_CHANGE:
          data.meta.from = leadStageSchema.parse(data.meta.from);
          data.meta.to = leadStageSchema.parse(data.meta.to);
          break;
        case ActivityType.ASSIGNMENT_CHANGE:
          data.meta.from = z.string().parse(data.meta.from); // agent name
          data.meta.to = z.string().parse(data.meta.to); // agent name
          break;
        // case ActivityType.NOTE:
        //   data.meta.content = z.string().min(1).max(5000).parse(data.meta.content);
        //    break;
        case ActivityType.NOTE:
          if (!data.meta || typeof data.meta.content !== "string") {
            throw new Error("Content is required for note");
          }

          data.meta.content = z.string().min(1).max(5000).parse(data.meta.content);
          break;
        default:
          break;
      }
    }
  });

export const createManyActivitiesSchema = z.array(createActivitySchema);

export type CreateActivityRequest = z.infer<typeof createActivitySchema>;

export const getLeadActivitiesSchema = z.object({
  leadId: z.uuid(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
});

export type GetLeadActivitiesRequest = z.infer<typeof getLeadActivitiesSchema>;

interface ActivitySummaryItem {
  id: string;
  actor: {
    name: string;
  };
  type: ActivityType;
  createdAt: Date;
  content: string | null;
}
export type ListLeadActivitiesResponseData = {
  activities: ActivitySummaryItem[];
  pagination: PaginationMeta;
};


export const createNoteSchema = z.object({
  content: z.string().min(1).max(5000),
});

export type CreateNoteRequest = z.infer<typeof createNoteSchema>;


export const callOutcomeEnum = z.enum([
  "NO_ANSWER",
  "ANSWERED",
  "WRONG_NUMBER",
  "BUSY",
  "CALL_BACK_LATER",
]);

export type CallOutcome = z.infer<typeof callOutcomeEnum>;

export const createCallAttemptSchema = z.object({
  outcome: callOutcomeEnum,
  notes: z.string().max(5000).optional(),
});

export type CreateCallAttemptRequest = z.infer<typeof createCallAttemptSchema>;



export const createAIActivitySchema = z.object({
  type: z.enum([
    ActivityType.AI_LEAD_BRIEF_GENERATED,
    ActivityType.AI_FOLLOWUP_DRAFT_GENERATED,
  ]),
  leadId: z.uuid(),
  actorId: z.uuid(),
  content: z.string().min(1),
});

export type CreateAIActivityRequest = z.infer<typeof createAIActivitySchema>;
