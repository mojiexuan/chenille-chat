import { relations } from "drizzle-orm";
import { messages } from "@/db/schema/message.schema";
import { messageAttachments } from "@/db/schema/message.attachment.schema";

/**
 * 消息附件关系，一对多关系
 */
export const messagesRelations = relations(messages, ({ many }) => ({
    // 定义attachments字段，对应多个messageAttachments记录
    attachments: many(messageAttachments),
}));

/**
 * 消息附件关系，多对一关闭
 */
export const messageAttachmentsRelations = relations(messageAttachments, ({ one }) => ({
    message: one(messages, {
        fields: [messageAttachments.messageId], // 关联message表的id外键字段
        references: [messages.id], // 关联message表的id主键
    }),
}));