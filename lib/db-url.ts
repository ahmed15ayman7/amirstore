// Vercel storage integrations may add the DB URL under different names (e.g. with a "STORAGE_" prefix)
const env = process.env;

/** Direct connection — for prisma db push / seed */
export const directUrl = () =>
  env.DATABASE_URL || env.STORAGE_DATABASE_URL || env.POSTGRES_URL || env.STORAGE_POSTGRES_URL;

/** Pooled connection when available — better for serverless runtime */
export const runtimeUrl = () =>
  env.DATABASE_URL || env.STORAGE_DATABASE_URL_POOLED || env.STORAGE_DATABASE_URL || env.POSTGRES_URL || env.STORAGE_POSTGRES_URL;
