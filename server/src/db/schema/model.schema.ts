import {
    pgTable, serial, integer, varchar, text,
    timestamp, boolean,
} from "drizzle-orm/pg-core";
import { modelProviders } from "./model.provider.schema";

/**
 * 模型表
 */
export const models = pgTable("c_models", {
    id: serial("id").primaryKey(),
    providerId: integer("provider_id")
        .notNull()
        .references(() => modelProviders.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 50 }).notNull(),           // 显示名："GPT-5.5"
    modelName: varchar("model_name", { length: 100 }).notNull(), // API 名："gpt-5.5"
    description: text("description"),                           // 模型简介
    isActive: boolean("is_active").default(true).notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
});