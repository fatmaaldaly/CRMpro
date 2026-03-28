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
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: agent.email,
      password: agent.password,
      email_confirm: true,
    });

    if (error) {
      console.error("Error creating agent user:", error);
      throw error;
    }

    console.log(`Agent user created: ${data.user.id}`);

    const admin = await prisma.profile.create({
      data: {
        id: data.user.id,
        email: agent.email,
        name: agent.name,
        role: "AGENT",
      },
    });
  }

  console.log(`Agents created: ${agents.length}`);
};

main().catch((e) => {
  console.error(e);
});