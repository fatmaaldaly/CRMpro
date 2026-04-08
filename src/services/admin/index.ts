import { createUserSchema, listUsersPaginatedSchema, updateUserSchema } from "./schema";
import {
  createUser,
  deactivateUser,
  getUserById,
  listUsers,
  reactivateUser,
  updateUserById,
  resendInvite,
} from "./service";

export const AdminService = {
  user: {
    create: createUser,
    list: listUsers,
    get: getUserById,
    update: updateUserById,
    deactivate: deactivateUser,
    reactivate: reactivateUser,
    resendInvite: resendInvite,
  },
} as const;

export const AdminSchema = {
  user: {
    create: createUserSchema,
    update: updateUserSchema,
    listPaginated: listUsersPaginatedSchema,
  },
} as const;