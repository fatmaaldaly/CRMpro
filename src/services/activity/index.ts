import { createActivities, getLeadActivities } from "./service";
import { getLeadActivitiesSchema } from "./schema";

export const ActivityService = {
  create: createActivities,
  getByLeadId: getLeadActivities,
} as const;

export const ActivitySchema = {
  getByLeadId: getLeadActivitiesSchema,
} as const;

export type { CreateActivityRequest } from "./schema";
