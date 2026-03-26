import { prisma } from "@/lib/prisma";
import supabaseAdmin from "@/lib/supabase/admin";

const main = async () => {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: "admin@crm.com",
    password: "admin123",
    email_confirm: true,
  });

  if (error) {
    console.error("Error creating admin user:", error);
    throw error;
  }

  console.log(`Admin user created: ${data.user.id}`);

  const admin = await prisma.profile.create({
    data: {
      id: data.user.id,
      email: "admin@crm.com",
      name: "Hesham El-Mahdi",
      role: "ADMIN",
    },
  });

  console.log(`Admin created: ${admin.id}`);
};

main().catch((e) => {
  console.error(e);
});
