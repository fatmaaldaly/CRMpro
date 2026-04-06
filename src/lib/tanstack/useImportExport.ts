import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { ImportRequest, ImportSummary } from "@/services/import-export/schema";

export const useImport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: ImportRequest): Promise<ImportSummary> => {
      const { data } = await api.post("/admin/import", request);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
};