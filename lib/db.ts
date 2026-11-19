import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { runtimeUrl } from "@/lib/db-url";

const g = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = g.prisma ?? new PrismaClient({ adapter: new PrismaPg({ connectionString: runtimeUrl() }) });

if (process.env.NODE_ENV !== "production") g.prisma = prisma;
