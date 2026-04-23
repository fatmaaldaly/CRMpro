import type { ManagerReport } from "@/services/dashboard/types";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";


export function useManagerReport() {
  return useQuery<ManagerReport>({
      queryKey:["manager-report"],
      queryFn: async () => {
          const {data} = await api.get(`report/`);
          return data.data;
      },
  });
    
}