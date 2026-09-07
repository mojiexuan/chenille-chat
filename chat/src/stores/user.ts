import type { User, UserSettings } from '@/types'

import { ref } from 'vue'
import { defineStore } from 'pinia'

import router from '@/router'
import { useAuth, useToast } from '@/composables'
import { 
    phoneLoginRequest, 
    logoutRequest, 
    userInfoRequest, 
    userUsageAiTokenRequest, 
    userSettingsRequest, 
    updateUserSettingsRequest 
} from '@/request'
import defaultAvatar from '@/assets/images/avatar.png'
import { useModelStore } from './model'

/**
 * 用户store
 * @author 陈佳宝
 * @date 2026-01-12
 */
export const useUserStore = defineStore('user', () => {
    const user = ref<User>({
        nickname: '未登录',
        avatar: defaultAvatar,
        // token: localStorage.getItem(TOKEN_KEY),
        settings: {
            isLocationEnabled: false,
        },
    })

    /**
     * 登录
     * @author 陈佳宝
     * @date 2026-01-12
     */
    async function phoneLogin(phone: string, code: string): Promise<void> {
        try {
            await phoneLoginRequest(phone, code)
        }catch {
            // 登示错误提示
            useToast().error('登录结果异常')
            return
        }
        // 隐藏AuthModal
        useAuth().hide()
        // 刷新当前路由
        router.go(0)
    }

    /**
     * 刷新用户信息
     * @author 陈佳宝
     * @date 2026-01-22
     */
    async function refreshUserInfo(): Promise<void> {
        // 模型store
        const modelStore = useModelStore()
        Promise.all([
            userInfoRequest(),
            userSettingsRequest(),
            modelStore.refreshModelList(),
        ]).then(([me, meSettings, _]) => {
            if (me.username) {
                user.value.username = me.username
            }
            if (me.avatar) {
                user.value.avatar = me.avatar
            }
            if (me.nickname) {
                user.value.nickname = me.nickname
            }
            if (me.email) {
                user.value.email = me.email
            }
            if (me.phone) {
                user.value.phone = me.phone
            }
            if (me.gender) {
                user.value.gender = me.gender
            }
            if (meSettings) {
                user.value.settings = meSettings
            }
            useAuth().hide();
        }).catch(() => {
            // 退出登录
            logout();
        })
    }

    /**
     * 登出
     * @author 陈佳宝
     * @date 2026-01-12
     */
    function logout(): void {
        // 退出登录
        logoutRequest();
        // 移除token
        user.value.token = null
        // 清空用户信息
        user.value.nickname = '未登录'
        user.value.avatar = defaultAvatar
        user.value.username = ''
        user.value.email = ''
        user.value.phone = ''
        user.value.gender = ''
        // 展示AuthModal
        useAuth().show()
    }

    /**
     * 获取用户使用AI令牌
     * @author 陈佳宝
     * @date 2026-01-22
     */
    async function getUserUsageAiToken(): Promise<void> {
        const data = await userUsageAiTokenRequest()
        if (data) {
            user.value.usageToken = data
        }
    }

    /**
     * 更新用户设置
     * @author 陈佳宝
     * @date 2026-01-22
     */
    async function updateUserSettings(data: Partial<UserSettings>): Promise<void> {
        const settings = await updateUserSettingsRequest(data)
        if (settings) {
            user.value.settings = settings
        }
    }

    return {
        user,
        phoneLogin,
        refreshUserInfo,
        logout,
        getUserUsageAiToken,
        updateUserSettings,
    }
})