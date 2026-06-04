import { logger } from "@/utils";
import type { IpLocationResponse, IpLocation } from "@/types/ip.type";

/**
 * IP地址转换为位置信息
 * @param ip IP地址
 * @returns 位置信息
 */
export async function ipToLocation(ip: string) {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN`);
    const data = (await res.json()) as IpLocationResponse;
    if (data.status === "success") {
      return data as IpLocation;
    } else {
      return null;
    }
  } catch (error) {
    logger.error(error, "IP地址转换为位置信息失败");
    return null;
  }
}
