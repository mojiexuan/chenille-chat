import { post } from './fetch';

/**
 * 获取手机号验证码
 */
export const phoneCodeRequest = (phone: string) => {
    return post<void>('/auth/phone/code', {
        phone,
    });
}

/**
 * 手机号登录
 */
export const phoneLoginRequest = (phone: string, code: string) => {
    return post<void>('/auth/phone/login', {
        phone,
        code,
    });
}

/**
 * 退出登录
 */
export const logoutRequest = () => {
    return post<void>('/auth/logout', void 0, { showErrorToast: false });
}
