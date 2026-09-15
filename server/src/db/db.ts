import * as schema from "./schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import { config } from "@/config";
import path from "path";
import { AgentKey } from "@/enumeration";
import { logger } from "@/utils";

/**
 * 数据库连接池
 */
export const pool = new pg.Pool({
    host: config.DB_HOST,
    port: Number(config.DB_PORT),
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
});

export const db = drizzle(pool, {schema});

/**
 * 运行数据库迁移
 */
export async function runMigrate() {
    const migrationsFolder = path.join(__dirname, "../../drizzle");
    await migrate(db, { migrationsFolder });
    logger.info("数据库迁移完成");
}

/**
 * 种子数据：创建默认的agent
 */
async function seedAgents() {
    const seedData = [
        {
            name: "生成会话标题",
            key: AgentKey.GenerateSessionTitle,
            description: "根据会话内容生成简要的会话标题",
        },
        {
            name: "Ai 聊天默认模型",
            key: AgentKey.AiChatDefaultModel,
            description: "聊天时，若未传入模型Id，默认使用该模型Id",
        },
        {
            name: "动词指示器",
            key: AgentKey.GenerateGerundIndicator,
            description: "根据会话内容生成动词指示器，主要是个小创意",
        },
        {
            name: "语音识别",
            key: AgentKey.AsrRecognition,
            description: "将音频转换为文本",
        },
        {
            name: "视觉识别",
            key: AgentKey.VisionRecognition,
            description: "将图片/文档/视频转换为文本",
        },
    ];

    for (const item of seedData) {
        await db.insert(schema.agents).values(item).onConflictDoNothing({
            target: schema.agents.key,
        });
    }
}

/**
 * 运行种子数据
 */
export async function runSeed() {
    // 种子数据：创建默认的agent
    await seedAgents();
    logger.info("种子数据创建完成");
}