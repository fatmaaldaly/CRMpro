import { getDashboardData, getManagerReport } from "./service";
export type { DashboardData } from "./types";

export const DashboardService = {
  getDashboardData,
  getManagerReport,
} as const;