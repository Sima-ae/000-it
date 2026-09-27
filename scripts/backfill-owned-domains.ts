import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.domainOrder.findMany({
    where: { status: "REGISTERED", userId: { not: null } },
    orderBy: { createdAt: "asc" },
  });

  let created = 0;
  let skipped = 0;
  for (const order of orders) {
    if (!order.userId) continue;
    const domainName = order.domainName.toLowerCase();
    const tld = domainName.split(".").pop() || "";
    const existing = await prisma.ownedDomain.findUnique({
      where: { domainName },
    });
    if (existing) {
      skipped += 1;
      continue;
    }
    await prisma.ownedDomain.create({
      data: {
        domainName,
        tld,
        status: "ACTIVE",
        userId: order.userId,
        expiresAt: new Date(
          Date.now() + Math.max(1, order.years) * 365.25 * 24 * 60 * 60 * 1000,
        ),
        lastSyncedAt: new Date(),
      },
    });
    created += 1;
  }
  console.log({ created, skipped, fromOrders: orders.length });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
