import {
  CreateCallAttemptRequest,
  GetLeadActivitiesRequest,
  ListLeadActivitiesResponseData,
} from "@/services/activity/schema";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useGetLeadActivities(request: GetLeadActivitiesRequest) {
  return useQuery({
    queryKey: ["activities", request],
    queryFn: async (): Promise<ListLeadActivitiesResponseData> => {
      const { data } = await api.get(`/leads/${request.leadId}/activities`, {
        params: {
          page: request.page,
          pageSize: request.pageSize,
        },
      });

      return data.data;
    },
  });
}


export function useCreateNote(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const { data } = await api.post(`/leads/${leadId}/activities`, {
       content,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}


export function useLogCallAttempt(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCallAttemptRequest) => {
      const response = await api.post(`/leads/${leadId}/call-attempt`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}
