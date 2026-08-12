/**
 * Reset the canonical SUPER_ADMIN password (info@000-it.com).
 *
 * On VPS:
 *   cd /var/www/000-it.com
 *   NEW_PASSWORD='YourStrongPass!' npx tsx scripts/reset-super-password.ts
 *
 * Or interactively (password not stored in shell history if you type it at the prompt):
 *   npx tsx scripts/reset-super-password.ts
 */
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

const SUPER_ADMIN_EMAIL = "info@000-it.com";

async function readPassword(): Promise<string> {
  const fromEnv = process.env.NEW_PASSWORD?.trim();
  if (fromEnv) return fromEnv;

  const rl = createInterface({ input, output });
  try {
    const password = (await rl.question("New SUPER_ADMIN password: ")).trim();
    if (!password) throw new Error("Password cannot be empty.");
    const confirm = (await rl.question("Confirm password: ")).trim();
    if (password !== confirm) throw new Error("Passwords do not match.");
    return password;
  } finally {
    rl.close();
  }
}

async function main() {
  const password = await readPassword();
  if (password.length < 8) {
    throw new Error("Use at least 8 characters.");
  }

  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email: SUPER_ADMIN_EMAIL },
    update: { password: hash, role: "SUPER_ADMIN" },
    create: {
      email: SUPER_ADMIN_EMAIL,
      name: "000",
      password: hash,
      role: "SUPER_ADMIN",
      companyName: "TripleZero iT",
      companySize: "1-10",
      industry: "Technology",
    },
  });

  console.log(`OK: password updated for ${user.email} (role=${user.role})`);
}

main()
  .catch((err) => {
    console.error("ERROR:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
