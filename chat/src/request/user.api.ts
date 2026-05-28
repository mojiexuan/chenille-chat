import type { User } from '@/types';
import { get } from './fetch';

/**
 * 获取用户信息
 */
export const userInfoRequest = () => {
    return get<User>('/user/me');
}