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
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
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
  const y = date.getFullYear();
  const M = date.getMonth() + 1;
  const d = date.getDate();
  const H = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();

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
  return format + WEEK_DAYS[date.getDay()];
}
