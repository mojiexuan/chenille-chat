import { SessionData, SessionId } from "@/types";
import { Session } from "./session";
import * as fs from "fs";
import * as path from "path";

const SESSIONS_DIR = path.join(process.cwd(), ".sessions");

function ensureDir(): void {
  if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  }
}

function getSessionPath(sessionId: SessionId): string {
  return path.join(SESSIONS_DIR, `${sessionId}.json`);
}

function readSessionFile(sessionId: SessionId): SessionData | null {
  try {
    const filePath = getSessionPath(sessionId);
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content) as SessionData;
  } catch {
    return null;
  }
}

function writeSessionFile(sessionData: SessionData): void {
  ensureDir();
  const filePath = getSessionPath(sessionData.sessionId);
  fs.writeFileSync(filePath, JSON.stringify(sessionData, null, 2), "utf-8");
}

/**
 * 添加新会话到存储
 * @param session 会话对象
 */
export function addSession(session: Session): void {
  const data = session.export();
  writeSessionFile(data);
}

/**
 * 获取会话
 * @param sessionId 会话ID
 * @returns 会话数据，不存在返回 null
 */
export function getSession(sessionId: SessionId): SessionData | null {
  return readSessionFile(sessionId);
}

/**
 * 删除会话
 * @param sessionId 会话ID
 */
export function removeSession(sessionId: SessionId): void {
  try {
    const filePath = getSessionPath(sessionId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
  }
}

/**
 * 更新会话：从 Session 对象导出数据并写回文件
 * @param session 会话对象
 */
export function updateSession(session: Session): void {
  const data = session.export();
  writeSessionFile(data);
}

/**
 * 列出所有会话ID
 */
export function listSessions(): SessionId[] {
  ensureDir();
  try {
    const files = fs.readdirSync(SESSIONS_DIR);
    return files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", "") as SessionId);
  } catch {
    return [];
  }
}
