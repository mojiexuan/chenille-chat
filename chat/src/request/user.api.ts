import type { User } from '@/types';
import { get, post } from './fetch';

/**
 * 获取用户信息
 */
export const userInfoRequest = () => {
    return get<User>('/user/me');
}

/**
 * 更新用户头像
 */
export const updateUserAvatarRequest = (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return post<void>("/user/me/avatar", void 0, {
        body: formData,
    });
}