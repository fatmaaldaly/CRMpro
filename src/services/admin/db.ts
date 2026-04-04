import { Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export async function dbFindUserByEmail(email: string) {
  return await prisma.profile.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
    },
  });
}

export async function dbFindUserById(id: string) {
  return await prisma.profile.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function dbListAllUsers() {
  return await prisma.profile.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function dbCreateProfile(data: {
  id: string;
  email: string;
  name: string;
  role: Role;
}) {
  return prisma.profile.create({
    data: {
      id: data.id, // Must match Supabase Auth user ID
      email: data.email,
      name: data.name,
      role: data.role,
      isActive: true, // New users are always active
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function dbUpdateUser(
  userId: string,
  data: { name?: string; role?: Role },
) {
  return prisma.profile.update({
    where: { id: userId },
    data: { name: data.name, role: data.role },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
    },
  });
}

export async function dbDeactivateUser(userId: string) {
  return prisma.profile.update({
    where: { id: userId },
    data: { isActive: false },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
    },
  });
}

export async function dbReactivateUser(userId: string) {
  return prisma.profile.update({
    where: { id: userId },
    data: { isActive: true },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
    },
  });
}