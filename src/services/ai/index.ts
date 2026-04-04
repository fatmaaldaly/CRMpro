import { generateLeadBriefSchema, saveLeadBriefSchema, generateCallFollowUpSchema, saveCallFollowupSchema } from "./schema";
import { generateLeadBrief, saveLeadBrief, getLastLeadBrief, generateCallFollowup, saveCallFollowup } from "./service";

export const AIService = {
  generateLeadBrief,
  saveLeadBrief,
  getLastLeadBrief,
  generateCallFollowup,
  saveCallFollowup,
} as const;

export const AISchema = {
  generateLeadBrief: generateLeadBriefSchema,
  saveLeadBrief: saveLeadBriefSchema,
  generateCallFollowup: generateCallFollowUpSchema,
  saveCallFollowup: saveCallFollowupSchema,
} as const;