import { relations } from "drizzle-orm";
import { messages } from "@/db/schema/message.schema";
import { messageAttachments } from "@/db/schema/message.attachment.schema";
import { messageTools } from "@/db/schema/message.tool.schema";

/**
 * 消息关系，一对多附件、一对一工具记录
 */
export const messagesRelations = relations(messages, ({ many,one }) => ({
    // 定义attachments字段，对应多个messageAttachments记录
    attachments: many(messageAttachments),
    // 定义tool字段，对应一个messageTools记录
    tools: one(messageTools, {
        fields: [messages.id], // 关联message表的id主键
        references: [messageTools.messageId], // 关联messageTools表的messageId外键
    }),
}));

/**
 * 消息附件关系，多对一反向关联
 */
export const messageAttachmentsRelations = relations(messageAttachments, ({ one }) => ({
    message: one(messages, {
        fields: [messageAttachments.messageId], // 关联message表的id外键字段
        references: [messages.id], // 关联message表的id主键
    }),
}));

/**
 * 消息工具关系，多对一反向关联
 */
export const messageToolsRelations = relations(messageTools, ({ one }) => ({
    message: one(messages, {
        fields: [messageTools.messageId], // 关联message表的id外键字段
        references: [messages.id], // 关联message表的id主键
    }),
}));