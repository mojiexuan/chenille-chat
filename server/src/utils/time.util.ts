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
