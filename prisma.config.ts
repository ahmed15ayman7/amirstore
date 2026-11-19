import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { seed: "tsx prisma/seed.ts" },
  // `prisma generate` doesn't need a real DB, so don't fail when DATABASE_URL is missing (e.g. during npm install)
  datasource: { url: (process.env.DATABASE_URL || process.env.POSTGRES_URL) ?? "postgresql://user:pass@localhost:5432/placeholder" },
});
