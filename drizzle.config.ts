import type { Config } from "drizzle-kit";
import { env } from "@/env.js";

import { DATABASE_PREFIX } from "@/lib/constants";

export default {
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  out: "./drizzle",
  dbCredentials: {
    url: env.DATABASE_URL ?? "postgresql://localhost:5432/dummy",
  },
  tablesFilter: [`${DATABASE_PREFIX}_*`],
} satisfies Config;
