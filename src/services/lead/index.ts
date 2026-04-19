import { reassignLeadsSchema } from "./schema";
import { createLead, reassignLeads, updateLead } from "./service";

export const LeadService = {
  createLead: createLead,
  updateLead: updateLead,
  reassignLead : reassignLeads,
};


export const LeadSchema = {
  reassignLeads: reassignLeadsSchema,
}