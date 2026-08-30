import type { AliyunCaptchaInstance } from '@/types';

// 阿里云验证码实例
let captchaInstance: AliyunCaptchaInstance | null = null;

/**
 * 确保DOM元素存在
 */
function ensureDom(): HTMLElement {
    // 渲染容器
    let element = document.getElementById('captcha-aliyun-element')
    if (!element) {
        element = document.createElement('div')
        element.id = 'captcha-aliyun-element'
        document.body.appendChild(element)
    }
    // 隐藏的触发按钮
    let button = document.getElementById('captcha-aliyun-button')
    if (!button) {
        button = document.createElement('div')
        button.id = 'captcha-aliyun-button'
        // 不要用 display:none，用移出可视区的方式，保证 .click() 稳定触发
        button.style.cssText =
            'position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;'
        document.body.appendChild(button)
    }
    return button
}

/**
 * 初始化阿里云验证码
 */
export function initCaptcha() {
    if (captchaInstance) {
        return;
    }
    // 确保DOM元素存在
    ensureDom()
    // 初始化验证码
    window.initAliyunCaptcha({
        SceneId: "1pdyuzd3",
        mode: "popup",
        element: "#captcha-aliyun-element",
        button: "#captcha-aliyun-button",
        success: (captchaVerifyParam: string) => {
            console.log(captchaVerifyParam);
            console.log(typeof captchaVerifyParam);
        },
        getInstance: (instance: AliyunCaptchaInstance) => {
            captchaInstance = instance;
        }
    });
}

/**
 * 业务需要时调用这个来唤起验证码
 */
export function triggerCaptcha() {
    if (!captchaInstance) {
        console.error('验证码实例未初始化')
        return
    }
    document.getElementById('captcha-aliyun-button')?.click()
}
