// barrel file is important for clean architecture, maintainability, and readability
import {
  generateCallFollowUpRequestSchema,
  generateLeadBriefSchema,
  saveLeadBriefSchema,
  saveCallFollowUpSchema,
} from "./schema";
import {
  generateCallFollowup,
  generateLeadBrief,
  getLastLeadBrief,
  saveLeadBrief,
  saveCallFollowUp,
} from "./service";

export const AIService = {
  generateLeadBrief,
  saveLeadBrief,
  getLastLeadBrief,
  generateCallFollowup,
  saveCallFollowUp,
} as const;

export const AISchema = {
  generateLeadBrief: generateLeadBriefSchema,
  saveLeadBrief: saveLeadBriefSchema,
  generateCallFollowup: generateCallFollowUpRequestSchema,
  saveCallFollowUp: saveCallFollowUpSchema,
} as const;