
// import { prisma } from "@/lib/prisma";
// import supabaseAdmin from "@/lib/supabase/admin";


// const main = async () => {
//   const { data, error } = await supabaseAdmin.auth.admin.createUser({
//     email: "admin@crm.com",
//     password: "admin123",
//     email_confirm: true,
//   }
// );

//   if (error) {
//     console.error("Error creating admin user:", error);
//     throw error;
//   }


//   console.log(`Admin user created: ${data.user.id}`);

//   const admin = await prisma.profile.create({
//     data: {
//       id: data.user.id,
//       email: "admin@crm.com",
//       name: "Hesham El-Mahdi",
//       role: "ADMIN",
//     },
//   });

//   console.log(`Admin created: ${admin.id}`);
// };

// main().catch((e) => {
//   console.error(e);
// });


// const main1 = async () => {
//   const { data, error } = await supabaseAdmin.auth.admin.createUser({
//     email: "manager@crm.com",
//     password: "manager123",
//     email_confirm: true,
//   }
// );

//   if (error) {
//     console.error("Error creating manager user:", error);
//     throw error;
//   }


//   console.log(`Manager user created: ${data.user.id}`);

//   const manager = await prisma.profile.create({
//     data: {
//       id: data.user.id,
//       email: "manager@crm.com",
//       name: "Fatma Aldaly",
//       role: "MANAGER",
//     },
//   });

//   console.log(`Manager created: ${manager.id}`);
// };

// main1().catch((e) => {
//   console.error(e);
// });


import { prisma } from "@/lib/prisma";
import supabaseAdmin from "@/lib/supabase/admin";
import { Role } from "@/generated/prisma/client";

async function createUser(email: string, password: string, name: string, role: Role) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) throw error;

  console.log(`${role} auth created: ${data.user.id}`);

  const profile = await prisma.profile.upsert({
    where: { email },
    update: {},
    create: {
      id: data.user.id,
      email,
      name,
      role,
    },
  });

  console.log(`${role} profile created: ${profile.id}`);
}

async function main() {
  await createUser(
    "admin@crm.com",
    "admin123",
    "Admin",
    Role.ADMIN
  );

  await createUser(
    "manager@crm.com",
    "manager123",
    "Manager",
    Role.MANAGER
  );
}

main()
  .then(() => {
    console.log("Seed completed successfully");
  })
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  });