/**
 * 时间单位 → 秒 的换算表
 */
const DURATION_UNIT_SECONDS: Record<string, number> = {
  s: 1,
  m: 60,
  h: 3600,
  d: 86400,
  w: 604800,
  y: 31536000, // 约 365 天
};

/**
 * 东八区时区偏移（毫秒）
 */
const TIMEZONE_OFFSET_MS = 8 * 60 * 60 * 1000;

/**
 * 东八区 RFC3339 时区后缀，与 TIMEZONE_OFFSET_MS 对应
 */
export const EAST8_TIMEZONE_SUFFIX = "+08:00";

/**
 * 将时间转换为东八区对应的“虚拟时间”
 *
 * 注意：这里必须配合 getUTC* 系列方法读取，不能用 getHours() 等本地方法。
 * 因为 getTime() 返回的是绝对时间戳、getUTC* 读取的也是 UTC 分量，
 * 二者都不受系统时区影响，所以在任何时区的服务器上结果都稳定为东八区，不会双重偏移；
 * 而 getHours()/getDate() 等本地方法会受系统时区影响，若在已是东八区的机器上使用会再叠加一次偏移。
 */
export function toEast8(date: Date): Date {
  return new Date(date.getTime() + TIMEZONE_OFFSET_MS);
}

/**
 * 将expiresIn时间单位转换为秒
 * @param expiresIn 时间单位字符串，例如 "1h"、"2d" 等
 * @returns 秒数
 */
export function expiresInToSeconds(expiresIn: string | number): number {
  // 如果是数字，直接返回
  if (typeof expiresIn === "number") {
    // 检查是否为有限数字且大于0
    if (!Number.isFinite(expiresIn) || expiresIn <= 0) {
      throw new Error(`非法的过期时间：${expiresIn}`);
    }
    // 返回小于或等于其数值参数的最大整数。
    return Math.floor(expiresIn);
  }

  const trimmed = expiresIn.trim();
  // 纯数字字符串按秒
  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  let total = 0;
  let matched = false;
  const re = /(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?/g;
  let match: RegExpExecArray | null;

  // 解析时间单位字符串
  while ((match = re.exec(trimmed)) !== null) {
    // 检查是否有单位
    if (typeof match[2] === "undefined") {
      throw new Error(`过期时间缺少单位：${match[0]}`);
    }
    matched = true;
    const value = Number(match[1]);
    const unit = match[2].toLowerCase();
    // 取单位首字母：hour/hours/h -> h，min/minute/mins -> m，依此类推
    const normalized = unit.replace(/^sec(ond)?s?$/, "s")
      .replace(/^min(ute)?s?$/, "m")
      .replace(/^h(ou)?rs?$/, "h")
      .replace(/^days?$/, "d")
      .replace(/^weeks?$/, "w")
      .replace(/^years?$/, "y");

    // 取单位对应的秒数
    const seconds = DURATION_UNIT_SECONDS[normalized];
    // 如果单位不存在，抛出错误
    if (!seconds) {
      throw new Error(`无法解析过期时间单位：${match[0]}`);
    }
    // 累加秒数
    total += value * seconds;
  }

  // 检查是否匹配了所有单位且总秒数大于0
  if (!matched || total <= 0) {
    throw new Error(`无法解析过期时间：${expiresIn}`);
  }
  // 返回总秒数
  return total;
}

/**
 * 获取当前时间的各个分量
 */
export function getTimeComponents(date = new Date()) {
  // 转换为东八区时间，避免受服务器系统时区影响
  const east8 = toEast8(date);
  const year = east8.getUTCFullYear();
  const month = east8.getUTCMonth() + 1;
  const day = east8.getUTCDate();
  const hour = east8.getUTCHours();
  const minute = east8.getUTCMinutes();
  const second = east8.getUTCSeconds();
  const timestamp = date.getTime();

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    timestamp,
    pad: (n: number) => String(n).padStart(2, "0"),
    /** 格式化为 "2026/06/02" 的目录路径 */
    datePath: `${year}/${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`,
    /** 格式化为 "20260602153045" 的时间戳字符串 */
    compact: `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}${String(hour).padStart(2, "0")}${String(minute).padStart(2, "0")}${String(second).padStart(2, "0")}`,
  };
}

/**
 * 格式化时间
 */
export function formatTime(date = new Date(), template = "yyyy年M月d日 HH:mm") {
  // 转换为东八区时间，避免受服务器系统时区影响
  const east8 = toEast8(date);
  const y = east8.getUTCFullYear();
  const M = east8.getUTCMonth() + 1;
  const d = east8.getUTCDate();
  const H = east8.getUTCHours();
  const m = east8.getUTCMinutes();
  const s = east8.getUTCSeconds();

  const pad = (n: number) => String(n).padStart(2, "0");

  return template
    .replace("yyyy", String(y))
    .replace("MM", pad(M))
    .replace("M", String(M))
    .replace("dd", pad(d))
    .replace("d", String(d))
    .replace("HH", pad(H))
    .replace("H", String(H))
    .replace("mm", pad(m))
    .replace("m", String(m))
    .replace("ss", pad(s))
    .replace("s", String(s));
}

/**
 * 获取当前周几
 *
 * @param format 前缀，默认"周"
 * @returns 例："周一"
 */
export function getWeekDay(date = new Date(), format = "周") {
  const WEEK_DAYS = ["日", "一", "二", "三", "四", "五", "六"];
  // 转换为东八区时间后再取星期
  return format + WEEK_DAYS[toEast8(date).getUTCDay()];
}

/**
 * 获取当前时间加上指定秒数后的时间
 * @param seconds 需要增加的秒数（整数）
 * @param from 起始时间，默认当前时间
 * @returns 增加指定秒数后的 Date 对象
 */
export function getDateAfterSeconds(seconds: number, from = new Date()): Date {
  if (!Number.isInteger(seconds) || seconds <= 0) {
    throw new Error(`秒数必须为整数且大于0：${seconds}`);
  }
  return new Date(from.getTime() + seconds * 1000);
}
