/**
 * Creates the first admin user and default company settings.
 * Run with: npm run db:seed
 * Uses ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME from .env, with sensible defaults.
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "123456";
  const name = process.env.ADMIN_NAME || "Admin";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin user already exists: ${email}`);
  } else {
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { name, email, password: hashed, role: "ADMIN" },
    });
    console.log(`Created admin user:
  email: ${email}
  password: ${password}
  (change this password after first login)`);
  }

  const settings = await prisma.companySettings.findFirst();
  if (!settings) {
    await prisma.companySettings.create({
      data: { companyName: "Your Company", invoicePrefix: "INV" },
    });
    console.log("Created default company settings.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
