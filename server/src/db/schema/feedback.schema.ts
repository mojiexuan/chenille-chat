import {
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./user.schema";
import { nextUlid } from "@/utils";
import { FeedbackStatus } from "@/enumeration";

export const AppFeedback = pgTable(
  "c_app_feedback",
  {
    id: text("id").primaryKey().$defaultFn(() => nextUlid()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    imageUrl: text("image_url"),
    status: varchar("status", { length: 20 })
        .$type<FeedbackStatus>()
        .default(FeedbackStatus.Pending),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
  },
);