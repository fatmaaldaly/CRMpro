import { UserSnapshot } from "@/utils/types/user";
import {dbGetLeadWithContext, dbGetNextReminder, dbGetRecentActivities, dbGetLastLeadBrief, dbCreateLeadBrief, dbCreateCallFollowup} from "./db";
import { buildCallFollowupPrompt, buildLeadBriefPrompt, validateLeadAccess } from "./helpers";
import { generateText, Output } from "ai";
import { leadBriefSchema, callFollowUpSchema, SaveLeadBriefRequest, SaveCallFollowupRequest } from "./schema";
import { LeadServiceError } from "../lead/service";
import { CallOutcome } from "../activity/schema";
import { Profile} from "@/generated/prisma/client";


export async function generateLeadBrief(
  leadId: string,
  userSnapshot: UserSnapshot,
) {

  
  // Step 1: Fetch the lead, queries the db for the lead with the given leadId
  const lead = await dbGetLeadWithContext(leadId);
  if (!lead) {
    throw new Error("Lead not found");
  }

  // Step 2: Check user permissions
  if (!validateLeadAccess(lead.assignedTo?.id, userSnapshot)) {
    throw new Error("You are not authorized to access this lead");
  }

  // Step 3: Fetch related data 
  // Promise.all runs both queries at the same time to save time
  const [activities, nextReminder] = await Promise.all([
    dbGetRecentActivities(leadId),
    dbGetNextReminder(leadId),
  ]);
  
  // Step 4: Build the AI prompt
  // buildLeadBriefPrompt creates a text prompt that will be sent to the AI model
  const prompt = buildLeadBriefPrompt({
    leadContext: lead,
    recentActivities: activities,
    nextReminder: nextReminder,
  });
  
  // Step 5: Call the AI model
  // generateText is the AI function that creates the lead brief
  const { output } = await generateText({
    // specifies which AI model to use
    model: "deepseek/deepseek-v3.2-thinking",
    // tells the AI to format its output according to the leadBriefSchema 
    output: Output.object({ schema: leadBriefSchema }),
    prompt,
  });

  // will be returned to frontend
  return output;

}

export async function saveLeadBrief(
  request: SaveLeadBriefRequest,
  user: Profile,
) {
  const lead = await dbGetLeadWithContext(request.leadId);
  if (!lead) {
    throw new Error("Lead not found");
  }

  if (!(await validateLeadAccess(lead.assignedTo?.id, user))) {
    throw new Error("You are not authorized to access this lead");
  }

  const brief = await dbCreateLeadBrief(request, user);

  return brief;
}



export async function getLastLeadBrief(leadId: string, user: Profile) {
  const lead = await dbGetLeadWithContext(leadId);
  if (!lead) {
    throw new LeadServiceError("Lead not found", 404);
  }

  if (!(await validateLeadAccess(lead.assignedTo?.id, user))) {
    throw new LeadServiceError("Unauthorized", 403);
  }

  const row = await dbGetLastLeadBrief(leadId);
  return row ?? null;
}


export async function generateCallFollowup(input: {
  leadId: string, 
  callOutCome: CallOutcome, 
  agentNotes: string | undefined, 
  userSnapshot: UserSnapshot,
  actorId: string
}) {

 //fetch lead
 const lead = await dbGetLeadWithContext(input.leadId);
  if (!lead) {
    throw new Error("Lead not found");
  }

  // check access
  if(!validateLeadAccess(lead.assignedTo?.id, input.userSnapshot)) {
    throw new Error("You are not authorized to access this lead");
  }

  // get recent activities
  const [activities]= await Promise.all([
    dbGetRecentActivities(input.leadId, 10),
  ]);


  // build prompt
  const prompt = buildCallFollowupPrompt({
    leadContext: lead,
    recentActivities: activities,
    callOutcome: input.callOutCome,
    agentNotes: input.agentNotes,
  });


  // call the AI model
  const {output} = await generateText({
    model: "deepseek/deepseek-v3.2-thinking",
    output: Output.object({ schema: callFollowUpSchema }),
    prompt,
  })

  return output;
  
} 


export async function saveCallFollowup(
  request: SaveCallFollowupRequest, 
  user: Profile) {


  const lead = await dbGetLeadWithContext(request.leadId);
  if (!lead) {
    throw new LeadServiceError("Lead not found", 404);
  }

  if (!validateLeadAccess(lead.assignedTo?.id, user)) {
    throw new LeadServiceError("Unauthorized", 403);
  }

  const callFollowUp = await dbCreateCallFollowup(request, user);

  return callFollowUp;
}
