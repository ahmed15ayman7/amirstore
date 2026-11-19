import "dotenv/config";
import { defineConfig } from "prisma/config";
import { directUrl } from "./lib/db-url";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { seed: "tsx prisma/seed.ts" },
  // `prisma generate` doesn't need a real DB, so don't fail when DATABASE_URL is missing (e.g. during npm install)
  datasource: { url: directUrl() ?? "postgresql://user:pass@localhost:5432/placeholder" },
});
