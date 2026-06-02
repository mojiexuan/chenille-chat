import path from "path";
import fs from "fs";

/**
 * 上传文件路径
 */
export const UPLOADS_PATH = path.join(process.cwd(), "uploads");
/**
 * 临时文件路径
 */
export const TEMP_PATH = path.join(process.cwd(), "temp");

/**
 * 确保必要路径存在
 */
export function ensurePaths() {
  [UPLOADS_PATH, TEMP_PATH].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}
