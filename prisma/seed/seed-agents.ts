import { prisma } from "@/lib/prisma";
import supabaseAdmin from "@/lib/supabase/admin";

const main = async () => {
  const agents = [
    {
      name: "Agent 1",
      email: "agent1@crm.com",
      password: "agent123",
    },
    {
      name: "Agent 2",
      email: "agent2@crm.com",
      password: "agent123",
    },
    {
      name: "Agent 3",
      email: "agent3@crm.com",
      password: "agent123",
    },
    {
      name: "Agent 4",
      email: "agent4@crm.com",
      password: "agent123",
    },
    {
      name: "Agent 5",
      email: "agent5@crm.com",
      password: "agent123",
    },
  ];

  for (const agent of agents) {
    // Check if profile already exists in Prisma
    const existingProfile = await prisma.profile.findFirst({
      where: { email: agent.email },
    });

    if (existingProfile) {
      console.log(
        `Agent profile already exists: ${existingProfile.id} (${agent.email})`,
      );
      continue;
    }

    // Try to create Supabase user, or get existing user if email already exists
    let userId: string;
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: agent.email,
      password: agent.password,
      email_confirm: true,
    });

    if (error) {
      if (error.code === "email_exists") {
        // User already exists in Supabase, get their ID
        const { data: users, error: listError } =
          await supabaseAdmin.auth.admin.listUsers();
        if (listError) {
          console.error("Error listing users:", listError);
          throw listError;
        }
        const existingUser = users?.users.find((u) => u.email === agent.email);
        if (!existingUser) {
          console.error(`Could not find existing user for ${agent.email}`);
          throw new Error(`User exists but not found: ${agent.email}`);
        }
        userId = existingUser.id;
        console.log(
          `Agent user already exists in Supabase: ${userId} (${agent.email})`,
        );
      } else {
        console.error("Error creating agent user:", error);
        throw error;
      }
    } else {
      userId = data.user.id;
      console.log(`Agent user created: ${userId}`);
    }

    // Create profile in Prisma
    const admin = await prisma.profile.create({
      data: {
        id: userId,
        email: agent.email,
        name: agent.name,
        role: "AGENT",
      },
    });
    console.log(`Agent profile created: ${admin.id}`);
  }

  console.log(`Agents created: ${agents.length}`);
};

main().catch((e) => {
  console.error(e);
});