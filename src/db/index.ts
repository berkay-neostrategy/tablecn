import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env.js";

import * as schema from "./schema";

/**
 * Veritabanı bağlantısının mevcut olup olmadığını kontrol eder
 */
export const isDatabaseAvailable = !!env.DATABASE_URL;

/**
 * Veritabanı instance'ı - sadece DATABASE_URL varsa oluşturulur
 */
let dbInstance: ReturnType<typeof drizzle> | null = null;

if (isDatabaseAvailable && env.DATABASE_URL) {
  try {
    const client = postgres(env.DATABASE_URL);
    dbInstance = drizzle(client, { schema });
  } catch (error) {
    console.warn("⚠️ Veritabanı bağlantısı kurulamadı, mock data kullanılacak:", error);
  }
}

export const db = dbInstance;
