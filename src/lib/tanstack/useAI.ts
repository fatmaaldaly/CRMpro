import { CallFollowUp, LeadBrief } from "@/services/ai/schema";
import { api } from "../api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";



export function useGenerateLeadBrief(leadId: string) {
  // STEP1: Get Query Client, manager of all cached data in React Query
  const queryClient = useQueryClient();
  
  // STEP2: return a mutation, POST
  return useMutation({
    // a)mutation function, promise Ensures TypeScript knows what this function returns 
    mutationFn: async (): Promise<LeadBrief> => {
      // api call, body contains { leadId }, Response structure: { success: boolean, data: LeadBrief } from axios
      const { data } = await api.post("/ai/lead-brief", { leadId });
      return data.data;
    },
    // b) onSuccess: side effects after success
    onSuccess: () => {
      // Since generating a brief also creates an AI_LEAD_BRIEF_GENERATED activity in the timeline, we invalidate the activities cache so the timeline tab refreshes automatically.
      queryClient.invalidateQueries({ queryKey: ["activities", leadId] });
      console.log("invalidating activities", leadId);
    },
  });
}

export function useSaveBrief(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (brief: LeadBrief) => {
      const { data } = await api.post(`/ai/lead-brief/save`, {
        leadId,
        brief,
      });
      console.log("GET brief response:", data.data);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brief", leadId] });
    },
  });
}

// export function useGetBrief(leadId: string) {
//   return useQuery({
//     queryKey: ["brief", leadId],
//     queryFn: async (): Promise<{
//       leadBrief: {
//         id: string;
//         leadId: string;
//         brief: LeadBrief;
//         createdById: string;
//         createdAt: Date;
//         updatedAt: Date;
//       } | null;
//     }> => {
//       const { data } = await api.get(`/leads/${leadId}/lead-brief`);
//       return data.data;
//     },
//   });
// }

export function useGetBrief(leadId: string) {
  return useQuery({
    queryKey: ["brief", leadId],
    queryFn: async () => {
      const { data } = await api.get(`/leads/${leadId}/lead-brief`);
      return data.data;
    },

    select: (data) => {
      if (!data) return { leadBrief: null };

      return {
        leadBrief: data, 
      };
    },
  });
}


export function useGenerateCallFollowup(leadId: string) {
  const QueryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {callOutcome: string, agentNotes?: string}): Promise<CallFollowUp> => {
    const {data} = await api.post("/ai/call-followup", {leadId, ...args});
    return data.data;
    },

    onSuccess: () => {
      QueryClient.invalidateQueries({ queryKey: ["activities", leadId] });
    }
  })
 
}


export function useSaveFollowup(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (callFollowup: CallFollowUp) => {
      const { data } = await api.post(`/ai/call-followup/save`, {
        leadId,
        callFollowup,
      });

      console.log("Saved followup:", data.data);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followup", leadId] });
    },
  });
}


