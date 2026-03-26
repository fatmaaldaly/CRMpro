import { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export class AuthenticationError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export async function authenticateUser(allowedRoles?: Role[]) {
  // Step 1: Get the current session from Supabase
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no user, return error
  if (!user) {
    throw new AuthenticationError("Unauthorized", 401);
  }

  // Step 2: Fetch the user profile from the database
  const profile = await prisma.profile.findUnique({
    where: {
      id: user.id,
    },
  });

  if (!profile) {
    throw new AuthenticationError("User not found", 404);
  }

  if (!profile.isActive) {
    throw new AuthenticationError("User is not active", 403);
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    throw new AuthenticationError("Unauthorized", 403);
  }

  return profile;
}
