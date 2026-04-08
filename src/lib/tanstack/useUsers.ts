import { Role } from "@/generated/prisma/enums";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { CreateUserSchema, ListUsersPaginatedSchema, UpdateUserSchema } from "@/services/admin/schema";
import { PaginationMeta } from "@/utils/pagination";

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  lastSignInAt: string | null;
};

export interface ListUsersResponseData {
  users: User[];
  pagination: PaginationMeta;
}


// ------------------------------------------------------------------
// LIST USERS (Query)
// ------------------------------------------------------------------
//params: { page: number; pageSize: number }) {
export function useUsers(params: ListUsersPaginatedSchema) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: async (): Promise<ListUsersResponseData> => {
      const { data } = await api.get("/admin/users", {
        params,
      });
      return data.data;
    },
  });
}

// ------------------------------------------------------------------
// CREATE USER (Mutation)
// ------------------------------------------------------------------
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: CreateUserSchema): Promise<User> => {
      const { data } = await api.post("/admin/users", user);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

// ------------------------------------------------------------------
// UPDATE USER (Mutation)
// ------------------------------------------------------------------
export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: UpdateUserSchema): Promise<User> => {
      const { data } = await api.put(`/admin/users/${id}`, user);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

// ------------------------------------------------------------------
// DEACTIVATE USER (Mutation)
// ------------------------------------------------------------------
export function useDeactivateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<User> => {
      const { data } = await api.post(`/admin/users/${id}/deactivate`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

// ------------------------------------------------------------------
// REACTIVATE USER (Mutation)
// ------------------------------------------------------------------
export function useReactivateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<User> => {
      const { data } = await api.post(`/admin/users/${id}/reactivate`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}


export function useResendInvite(id: string) {
  return useMutation({
    mutationFn: async (): Promise<{ success: boolean; email: string; message: string }> => {
      const { data } = await api.post(`/admin/users/${id}/resend-invite`);
      return data.data;
    },
  });
}