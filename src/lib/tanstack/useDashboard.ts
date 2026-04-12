import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { DashboardData } from "@/services/dashboard";

/** Fetches dashboard overview including newLeadsThisWeek and conversionRate. */
export function useDashboardOverview() {
  return useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard");
      return data.data;
    },
    // Dashboard data is expensive to compute. Keep it fresh for
    // 60 seconds before refetching on window focus.
    staleTime: 60 * 1000,
  });
}