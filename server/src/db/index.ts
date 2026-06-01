import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import { config } from "@/config";
import path from "path";

const pool = new pg.Pool({
    host: config.DB_HOST,
    port: Number(config.DB_PORT),
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
});

export const db = drizzle(pool);

export async function runMigrate() {
    const migrationsFolder = path.join(__dirname, "../../drizzle");
    await migrate(db, { migrationsFolder });
}

export { pool };
export * from "./schema";