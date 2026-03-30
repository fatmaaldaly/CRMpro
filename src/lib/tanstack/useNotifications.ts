import {
  ListNotificationsParams,
  ListNotificationsResponseData,
  NotificationListItem,
} from "@/services/notification/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useGetNotifications(params: ListNotificationsParams) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: async (): Promise<ListNotificationsResponseData> => {
      const { data } = await api.get("/leads/notifications", {
        params,
      });
      return data.data;
    },
    refetchInterval: 1000 * 5, // 1 minute
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<NotificationListItem> => {
      const { data } = await api.patch(`/leads/notifications/${id}/read`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}