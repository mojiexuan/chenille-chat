import { defineConfig } from "drizzle-kit";
import { config } from "./";

export default defineConfig({
    schema: "./src/db/schema/*.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        host: config.DB_HOST,
        port: Number(config.DB_PORT),
        user: config.DB_USER,
        password: config.DB_PASSWORD,
        database: config.DB_NAME,
        ssl: false,
    },
});