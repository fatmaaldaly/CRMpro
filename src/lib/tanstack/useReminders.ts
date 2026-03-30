import { CreateReminderRequest} from "@/services/reminder/schema";
import { api } from "../api";
import { Reminder } from "@/generated/prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PaginationMeta } from "@/utils/pagination";


interface ReminderWithRelations extends Reminder {
  lead: { id: string; name: string };
  assignedTo: { id: string; name: string };
}

interface ListRemindersResponse {
  reminders: ReminderWithRelations[];
  pagination: PaginationMeta;
}

export function useCreateLeadReminder(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: CreateReminderRequest): Promise<Reminder> => {
      const { data } = await api.post(`/leads/${leadId}/reminders`, request);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-reminders"] });
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
}

export function useGetLeadReminders(
  leadId: string,
  params: { page: number; pageSize: number; status?: string },
) {
  return useQuery({
    queryKey: ["lead-reminders", leadId, params],
    queryFn: async (): Promise<ListRemindersResponse> => {
      const { data } = await api.get(`/leads/${leadId}/reminders`, { params });
      return data.data;
    },
    enabled: Boolean(leadId),
  });
}

export function useGetMyReminders(params: {
  page: number;
  pageSize: number;
  status?: string;
}) {
  return useQuery({
    queryKey: ["reminders", params],
    queryFn: async (): Promise<ListRemindersResponse> => {
      const { data } = await api.get("/reminders", { params });
      return data.data;
    },
  });
}

export function useCancelReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reminderId: string) => {
      const { data } = await api.patch(`/reminders/${reminderId}`, {
        status: "CANCELLED",
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-reminders"] });
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
}


export function useUpdateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { reminderId: string; status: string }): Promise<Reminder> => {
      const { reminderId, status } = params;
      const { data } = await api.patch(`/reminders/${reminderId}`, { status });
      return data.data;
    },
    onSuccess: () => {
      // Invalidate both lead-specific and general reminders
      queryClient.invalidateQueries({ queryKey: ["lead-reminders"] });
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
}