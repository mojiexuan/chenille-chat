import {
    pgTable,
    varchar,
    text,
    timestamp,
} from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { models } from "./model.schema";

export const agents = pgTable("c_agents", {
    id: text("id").primaryKey().$defaultFn(() => ulid()),
    name: varchar("name", { length: 50 }).notNull(),
    key: varchar("key", { length: 100 }).notNull().unique(), // agent查询键，代码中用此查询
    description: text("description"), // 描述
    modelId: text("model_id").references(() => models.id, { onDelete: "cascade" }), // 模型ID
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
});