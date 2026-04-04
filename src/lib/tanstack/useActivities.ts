import {
  CreateCallAttemptRequest,
  GetLeadActivitiesRequest,
  ListLeadActivitiesResponseData,
} from "@/services/activity/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
      const { data } = await api.post(`/leads/${leadId}/activities/note`, {
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
    mutationFn: async (payload: CreateCallAttemptRequest) => {
      const { data } = await api.post(
        `/leads/${leadId}/activities/call-attempt`,
        payload,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}