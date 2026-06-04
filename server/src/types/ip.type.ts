/**
 * IP地址位置信息
 */
export interface IpLocation {
  country: string;
  countryCode: string;
  city: string;
  region: string;
  regionName: string;
  lat: number;
  lng: number;
}

/**
 * IP地址位置信息响应
 */
export type IpLocationResponse = IpLocation & {
  status: "success" | "fail";
};
