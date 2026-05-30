import type { User } from '@/types'

import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import router from '@/router'
import { TOKEN_KEY } from '@/config'
import { useAuth, useToast } from '@/composables'
import { phoneLoginRequest, userInfoRequest } from '@/request'
import defaultAvatar from '@/assets/images/avatar.png'

/**
 * 用户store
 * @author 陈佳宝
 * @date 2026-01-12
 */
export const useUserStore = defineStore('user', () => {
    const user = ref<User>({
        nickname: '未登录',
        avatar: defaultAvatar,
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
        // 清空用户信息
        user.value.nickname = '未登录'
        user.value.avatar = defaultAvatar
        user.value.username = ''
        user.value.email = ''
        user.value.phone = ''
        user.value.gender = ''
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