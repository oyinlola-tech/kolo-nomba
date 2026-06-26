import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import * as argon2 from "argon2";
import { EnvConfig } from "../src/config/env.config";

async function main(): Promise<void> {
  const config = EnvConfig.getInstance();

  const email = config.SUPER_ADMIN_EMAIL;
  const password = config.SUPER_ADMIN_PASSWORD;

  const firstName = config.SUPER_ADMIN_FIRST_NAME;
  const lastName = config.SUPER_ADMIN_LAST_NAME;

  const adapter = new PrismaPg({ connectionString: config.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });
  const passwordHash = await argon2.hash(password);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, firstName, lastName },
    create: {
      email,
      phone: "0000000000",
      passwordHash,
      firstName,
      lastName,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });

  console.log(`Super admin ready: ${admin.email} (${admin.id})`);

  const wallet = await prisma.wallet.upsert({
    where: { id: "platform-main-wallet" },
    update: {},
    create: {
      id: "platform-main-wallet",
      ownerType: "PLATFORM",
      ownerId: "platform",
      balance: 0,
      currency: "NGN",
      status: "ACTIVE",
    },
  });

  console.log(`Platform wallet ready: ${wallet.id}`);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
