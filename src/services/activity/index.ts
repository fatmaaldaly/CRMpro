import { createActivities, getLeadActivities } from "./service";
import {
  createCallAttemptSchema,
  createNoteSchema,
  getLeadActivitiesSchema,
} from "./schema";

export const ActivityService = {
  create: createActivities,
  getByLeadId: getLeadActivities,
} as const;

export const ActivitySchema = {
  getByLeadId: getLeadActivitiesSchema,
  createNote: createNoteSchema,
  createCallAttempt: createCallAttemptSchema,
} as const;

export type {
  CallOutcome,
  CreateActivityRequest,
  CreateCallAttemptRequest,
  CreateNoteRequest,
} from "./schema";