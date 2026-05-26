import {
    pgTable, serial, varchar,
    timestamp, boolean,
} from "drizzle-orm/pg-core";
import { modelProviderEnum } from "@/enumeration";

/**
 * 模型供应商表（存 API Key、中转地址等凭证信息）
 */
export const modelProviders = pgTable("c_model_providers", {
    id: serial("id").primaryKey(),
    provider: modelProviderEnum("model_provider").notNull().unique(),
    name: varchar("name", { length: 50 }).notNull(),
    apiKey: varchar("api_key", { length: 512 }).notNull(),
    baseUrl: varchar("base_url", { length: 512 }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
});