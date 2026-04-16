import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { AttachmentListItem } from "@/services/attachments/schema";

// fetches all attachments for a specific lead
export function useAttachments(leadId: string) {
  // Here we are telling React Query: This query returns an array of attachments (AttachmentListItem[])
  return useQuery<AttachmentListItem[]>({
    queryKey: ["attachments", leadId],
    queryFn: async () => {
      const { data } = await api.get(`/leads/${leadId}/attachments`);
      return data.data;
    },
    // to avoid using expired links
    staleTime: 55 * 60 * 1000, // 55 min -- under the 60-min signed URL TTL
  });
}

export function useUploadAttachment(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      // create form data
      const formData = new FormData();
      // attach file
      formData.append("file", file);
      // send to backend
      const { data } = await api.post(`/leads/${leadId}/attachments`,formData,);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", leadId] }); // attachment list recives the new attachment
      queryClient.invalidateQueries({ queryKey: ["activities", leadId] });  // so the activity log gets updated
    },
  });
}


export function useDeleteAttachment(leadId: string, attachmentId: string){
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
     await api.delete(`/leads/${leadId}/attachments/${attachmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["attachments", leadId]});
      queryClient.invalidateQueries({queryKey: ["attachments", leadId]});
    },
  });

}