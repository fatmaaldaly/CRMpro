import { createUserSchema, updateUserSchema } from "./schema";
import {
  createUser,
  deactivateUser,
  getUserById,
  listUsers,
  reactivateUser,
  updateUserById,
} from "./service";

export const AdminService = {
  user: {
    create: createUser,
    list: listUsers,
    get: getUserById,
    update: updateUserById,
    deactivate: deactivateUser,
    reactivate: reactivateUser,
  },
} as const;

export const AdminSchema = {
  user: {
    create: createUserSchema,
    update: updateUserSchema,
  },
} as const;