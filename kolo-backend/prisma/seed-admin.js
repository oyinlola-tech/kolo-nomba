const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../dist/generated/prisma/client");
const argon2 = require("argon2");

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const firstName = process.env.SUPER_ADMIN_FIRST_NAME || "Super";
  const lastName = process.env.SUPER_ADMIN_LAST_NAME || "Admin";

  if (!email || !password) {
    console.error("SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD env vars are required");
    process.exit(1);
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
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
