import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { AttachmentListItem } from "@/services/attachments/schema";
const attachmentsQueryKey = (leadId: string) =>
  ["attachments", leadId] as const;
// ------------------------------------------------------------------
// LIST (Query)
// ------------------------------------------------------------------
export function useAttachments(leadId: string) {
  return useQuery<AttachmentListItem[]>({
    queryKey: attachmentsQueryKey(leadId),
    queryFn: async () => {
      const { data } = await api.get(`/leads/${leadId}/attachments`);
      return data.data;
    },
    enabled: Boolean(leadId),
    // Signed URLs expire in 1 hour. Refetch after 55 minutes to
    // make sure the user never clicks a stale link.
    staleTime: 55 * 60 * 1000,
  });
}

// ------------------------------------------------------------------
// UPLOAD (Mutation)
// ------------------------------------------------------------------
export function useUploadAttachment(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation<AttachmentListItem, Error, File>({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      // Do NOT set Content-Type manually here. axios inspects the
      // FormData instance and sets `multipart/form-data; boundary=...`
      // for you. Setting it by hand strips the boundary and the
      // server fails to parse the body.
      const { data } = await api.post(`/leads/${leadId}/attachments`, formData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: attachmentsQueryKey(leadId),
      });
      // Activity timeline also needs to refetch to show the new
      // ATTACHMENT_ADDED event. Matches the key used in useActivities.
      queryClient.invalidateQueries({
        queryKey: ["activities"],
      });
    },
  });
}

// ------------------------------------------------------------------
// DELETE (Mutation)
// ------------------------------------------------------------------
export function useDeleteAttachment(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation<{ id: string }, Error, string>({
    mutationFn: async (attachmentId) => {
      const { data } = await api.delete(
        `/leads/${leadId}/attachments/${attachmentId}`,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["attachments", leadId]});
      queryClient.invalidateQueries({queryKey: ["activities"],});
    },
  });
}