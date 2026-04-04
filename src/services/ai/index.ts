import {
  generateCallFollowUpRequestSchema,
  generateLeadBriefSchema,
  saveLeadBriefSchema,
} from "./schema";
import {
  generateCallFollowup,
  generateLeadBrief,
  getLastLeadBrief,
  saveLeadBrief,
} from "./service";

export const AIService = {
  generateLeadBrief,
  saveLeadBrief,
  getLastLeadBrief,
  generateCallFollowup,
} as const;

export const AISchema = {
  generateLeadBrief: generateLeadBriefSchema,
  saveLeadBrief: saveLeadBriefSchema,
  generateCallFollowup: generateCallFollowUpRequestSchema,
} as const;