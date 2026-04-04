import { uuidv4 } from "zod";
import {
  dbCreateProfile,
  dbDeactivateUser,
  dbFindUserByEmail,
  dbFindUserById,
  dbListAllUsers,
  dbReactivateUser,
  dbUpdateUser,
} from "./db";
import { CreateUserSchema, UpdateUserSchema } from "./schema";
import supabaseAdmin from "@/lib/supabase/admin";
import { resend } from "@/lib/resend";
import { generateInviteEmailHTML } from "./helpers";

// Custom error class for admin operations.
// Follows the same pattern as LeadServiceError and NotificationServiceError.
export class AdminServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "AdminServiceError";
  }
}

// ------------------------------------------------------------------
// CREATE USER
// ------------------------------------------------------------------

/**
 * Create a new user with a magic link invitation.
 *
 * This is a 4-step process:
 * 1. Check for duplicate email
 * 2. Create Supabase Auth user with a temporary password
 * 3. Create a Profile in our database (bridged by the same ID)
 * 4. Generate a magic link and send it via email
 *
 * If step 4 fails (email sending), the user is still created.
 * The admin can re-send the invitation later. We don't roll back
 * the user creation because the auth user + profile are valid —
 * only the email delivery failed.
 *
 * @param data - Validated CreateUserInput (email, name, role)
 * @returns The created Profile
 */
export async function createUser(data: CreateUserSchema) {
  // Step 1: Check for duplicate email
  const existingUser = await dbFindUserByEmail(data.email);
  if (existingUser) throw new AdminServiceError("User already exists", 409);

  // Step 2: Create Supabase Auth user
  // We will use a random temporary password
  const tempPassword = uuidv4().toString();
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: tempPassword,
      email_confirm: true,
    });

  if (authError || !authData.user) {
    console.error("Error creating Supabase Auth user:", authError);
    throw new AdminServiceError("Failed to create Supabase Auth user", 500);
  }

  // Step 3: Create Profile in our database
  const profile = await dbCreateProfile({
    id: authData.user.id,
    email: data.email,
    name: data.name,
    role: data.role,
  });

  // Step 4: Generate a magic link and send it via email
  const { data: magicLinkData, error: magicLinkError } =
    await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: data.email,
    });

  if (magicLinkError || !magicLinkData?.properties?.action_link) {
    console.error("Error generating magic link:", magicLinkError);
    return profile;
  }

  const magicLink = magicLinkData.properties.action_link;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: data.email,
    subject: "You're invited to CRM Pro",
    html: generateInviteEmailHTML(data.name, magicLink),
  });

  return profile;
}

// ------------------------------------------------------------------
// LIST USERS
// ------------------------------------------------------------------
/**
 * List all users in the system.
 * No role filtering — only admins can call this (enforced at route level).
 */
export async function listUsers() {
  return dbListAllUsers();
}

// ------------------------------------------------------------------
// GET USER BY ID
// ------------------------------------------------------------------
export async function getUserById(id: string) {
  const user = await dbFindUserById(id);
  if (!user) {
    throw new AdminServiceError("User not found", 404);
  }
  return user;
}

// ------------------------------------------------------------------
// UPDATE USER ROLE
// ------------------------------------------------------------------
/**
 * Change a user's role.
 *
 * Business rules:
 * - The target user must exist
 * - You cannot change your own role (prevent accidental self-demotion)
 *
 * @param adminId - The ID of the admin performing the action
 * @param targetUserId - The ID of the user whose role is changing
 * @param data - Validated UpdateUserRoleInput
 */
export async function updateUserById(
  adminId: string,
  targetUserId: string,
  data: UpdateUserSchema,
) {
  // Prevent self-modification
  if (adminId === targetUserId) {
    throw new AdminServiceError("You cannot change your own role", 400);
  }

  // Verify target exists
  const target = await dbFindUserById(targetUserId);
  if (!target) {
    throw new AdminServiceError("User not found", 404);
  }

  return dbUpdateUser(targetUserId, data);
}

// ------------------------------------------------------------------
// DEACTIVATE USER
// ------------------------------------------------------------------
/**
 * Deactivate a user (soft delete).
 *
 * Business rules:
 * - The target user must exist
 * - You cannot deactivate yourself
 * - The user's data remains intact for audit trails
 *
 * After deactivation:
 * - authenticateUser() checks isActive and returns 403
 * - The user cannot access any protected routes
 * - Their activities and history remain visible to the team
 *
 * @param adminId - The ID of the admin performing the action
 * @param targetUserId - The ID of the user to deactivate
 */
export async function deactivateUser(adminId: string, targetUserId: string) {
  if (adminId === targetUserId) {
    throw new AdminServiceError("You cannot deactivate yourself", 400);
  }

  const target = await dbFindUserById(targetUserId);
  if (!target) {
    throw new AdminServiceError("User not found", 404);
  }

  if (!target.isActive) {
    throw new AdminServiceError("User is already deactivated", 400);
  }

  return dbDeactivateUser(targetUserId);
}

// ------------------------------------------------------------------
// REACTIVATE USER
// ------------------------------------------------------------------
/**
 * Reactivate a previously deactivated user.
 * The inverse of deactivateUser.
 */
export async function reactivateUser(targetUserId: string) {
  const target = await dbFindUserById(targetUserId);
  if (!target) {
    throw new AdminServiceError("User not found", 404);
  }

  if (target.isActive) {
    throw new AdminServiceError("User is already active", 400);
  }

  return dbReactivateUser(targetUserId);
}