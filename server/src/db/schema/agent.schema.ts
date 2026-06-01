import {
    pgTable,
    serial,
    integer,
    varchar,
    text,
    timestamp,
} from "drizzle-orm/pg-core";
import { models } from "./model.schema";

export const agents = pgTable("c_agents", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 50 }).notNull(),
    key: varchar("key", { length: 100 }).notNull().unique(), // agent查询键，代码中用此查询
    description: text("description"), // 描述
    modelId: integer("model_id").references(() => models.id, { onDelete: "cascade" }), // 模型ID
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
});