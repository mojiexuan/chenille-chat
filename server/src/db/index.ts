import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { config } from "@/config";

const pool = new pg.Pool({
    host: config.DB_HOST,
    port: Number(config.DB_PORT),
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
});

export const db = drizzle(pool);
export { pool };