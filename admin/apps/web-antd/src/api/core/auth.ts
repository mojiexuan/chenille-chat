import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface PhoneCodeParams {
    phone: string;
  }

  export interface PhoneLoginParams {
    phone: string;
    code: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.PhoneLoginParams): Promise<AuthApi.LoginResult> {
  const token = await requestClient.post<string>('/auth/phone/login', data);
  return { accessToken: token };
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>('/auth/refresh', {
    withCredentials: true,
  });
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return;
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return [];
}

/**
 * 获取手机号验证码
 */
export const phoneCodeRequest = (phone: AuthApi.PhoneCodeParams) => {
  return requestClient.post<void>('/auth/phone/code', phone);
}
