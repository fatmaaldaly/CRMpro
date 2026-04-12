import { Role } from "@/generated/prisma/client";
import { EditLeadRequest } from "@/services/lead/schema";

const contactFields = ["name", "email", "phone"] as const;


export function canEditLeadContactFields(
  role: Role,
  data: EditLeadRequest,
) {
  if (role !== Role.AGENT) {
    return true;
  }


  // contactFields.some(...) → checks if any contact field is being updated in data
  // data[field] !== undefined → means the agent is trying to update that field
  // ! → invert the result:
  return !contactFields.some((field) => data[field] !== undefined);
}

export function canEditLeadAssignment(role: Role, data: EditLeadRequest) {
   if(role !== Role.AGENT){
    return true;
   }
    return data.assignedToId === undefined;
}