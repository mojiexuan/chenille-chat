import type { User } from '@/types';
import { post, get } from './fetch';

/**
 * 邮箱登录
 */
export const emailLoginRequest = (email: string, code: string) => {
    return post<User>('/auth/email/login', {
        email,
        code,
    });
}

/**
 * 获取邮箱验证码
 */
export const emailCodeRequest = (email: string) => {
    return get<void>(`/auth/email/code?email=${email}`);
}
