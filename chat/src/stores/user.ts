import type { User } from '@/types'

import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import router from '@/router'
import { TOKEN_KEY } from '@/config'
import { useAuth, useToast } from '@/composables'
import { phoneLoginRequest, userInfoRequest } from '@/request'

/**
 * 用户store
 * @author 陈佳宝
 * @date 2026-01-12
 */
export const useUserStore = defineStore('user', () => {
    const user = ref<User>({
        token: localStorage.getItem(TOKEN_KEY),
    })

    /**
     * 登录状态
     * @author 陈佳宝
     * @date 2026-01-12
     */
    const isLogin = computed(() => user.value.token !== null)

    /**
     * 设置token
     * @author 陈佳宝
     * @date 2026-01-13
     */
    function setToken(newToken: string): void {
        if (newToken) {
            user.value.token = newToken
            localStorage.setItem(TOKEN_KEY, newToken)
        }
    }

    /**
     * 登录
     * @author 陈佳宝
     * @date 2026-01-12
     */
    async function phoneLogin(phone: string, code: string): Promise<void> {
        const token = await phoneLoginRequest(phone, code)
        if (token) {
            // 设置token
            setToken(token)
        } else {
            // 登示错误提示
            useToast().error('登录结果异常')
            return
        }
        // 刷新用户信息
        refreshUserInfo();
        // 隐藏AuthModal
        useAuth().hide()
        // 跳转首页
        router.replace('/')
    }

    /**
     * 刷新用户信息
     * @author 陈佳宝
     * @date 2026-01-22
     */
    async function refreshUserInfo(): Promise<void> {
        const data = await userInfoRequest()
        if (data.username) {
            user.value.username = data.username
        }
        if (data.avatar) {
            user.value.avatar = data.avatar
        }
        if (data.nickname) {
            user.value.nickname = data.nickname
        }
        if (data.email) {
            user.value.email = data.email
        }
        if (data.phone) {
            user.value.phone = data.phone
        }
        if (data.gender) {
            user.value.gender = data.gender
        }
    }

    /**
     * 登出
     * @author 陈佳宝
     * @date 2026-01-12
     */
    function logout(): void {
        // 移除token
        user.value.token = null
        localStorage.removeItem(TOKEN_KEY)
        // 展示AuthModal
        useAuth().show()
    }

    return {
        user,
        isLogin,
        setToken,
        phoneLogin,
        refreshUserInfo,
        logout,
    }
})