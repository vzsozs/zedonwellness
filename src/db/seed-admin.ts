import { config } from "dotenv";
config();
config({ path: ".env.local", override: true });

async function main() {
  const { hash } = await import("bcryptjs");
  const { eq } = await import("drizzle-orm");
  const { db } = await import("./index");
  const { adminUsers } = await import("./schema");

  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] ?? "Admin";

  if (!email || !password) {
    console.error(
      "Usage: tsx src/db/seed-admin.ts <email> <password> [name]",
    );
    process.exit(1);
  }

  const passwordHash = await hash(password, 12);

  const existing = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.email, email),
  });

  if (existing) {
    await db
      .update(adminUsers)
      .set({ passwordHash, name })
      .where(eq(adminUsers.email, email));
    console.log(`Updated admin user: ${email}`);
  } else {
    await db.insert(adminUsers).values({ email, passwordHash, name });
    console.log(`Created admin user: ${email}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
