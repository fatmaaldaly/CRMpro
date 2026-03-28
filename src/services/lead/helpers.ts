import { ActivityType } from "@/generated/prisma/client";
import { CreateActivityRequest } from "../activity";
import { LeadDetail } from "./schema";


// This function checks what changed in a lead
// Creates activity logs for each change
// Returns a list of activities
// Helps build a history (audit trail) of all updates

interface BuildLeadChangeActivitiesParams {
  leadId: string;
  actorId: string;
  existingLead: LeadDetail;
  newLead: Partial<LeadDetail>;
}

export function buildLeadChangeActivities({
  leadId,
  actorId,
  existingLead,
  newLead,
}: BuildLeadChangeActivitiesParams) {
  const activities: CreateActivityRequest[] = [];

  if (newLead.status && newLead.status !== existingLead.status) {
    activities.push({
      leadId,
      actorId,
      type: ActivityType.STATUS_CHANGE,
      meta: {
        from: existingLead.status,
        to: newLead.status,
      },
    });
  }

  if (newLead.stage && newLead.stage !== existingLead.stage) {
    activities.push({
      leadId,
      actorId,
      type: ActivityType.STAGE_CHANGE,
      meta: {
        from: existingLead.stage,
        to: newLead.stage,
      },
    });
  }


  if(newLead.assignedToId && newLead.assignedToId !== existingLead.assignedToId){
    activities.push({
      leadId,
      actorId,
      type: ActivityType.ASSIGNMENT_CHANGE,
      meta: {
        from: existingLead.assignedTo?.name ?? "Unassigned",
        to: newLead.assignedTo?.name ?? "Unassigned",
      },
    });
  }

  return activities;
}
