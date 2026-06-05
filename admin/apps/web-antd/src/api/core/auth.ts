import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
  }

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
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/auth/login', data);
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
  return baseRequestClient.post('/auth/logout', {
    withCredentials: true,
  });
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient.get<string[]>('/auth/codes');
}

/**
 * 获取手机号验证码
 */
export const phoneCodeRequest = (phone: AuthApi.PhoneCodeParams) => {
  return requestClient.post<void>('/auth/phone/code', phone);
}

/**
 * 手机号登录
 */
export const phoneLoginRequest = (data: AuthApi.PhoneLoginParams) => {
  return requestClient.post<string>('/auth/phone/login', data);
}
