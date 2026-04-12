import { getDashboardData } from "./service";
export type { DashboardData } from "./types";

export const DashboardService = {
  getDashboardData,
} as const;