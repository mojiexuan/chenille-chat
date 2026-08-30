import { AliyunCaptchaConfig,InitAliyunCaptcha } from './captcha.d';

/**
 * 扩展window对象
 */
declare global {
  interface Window {
    AliyunCaptchaConfig: AliyunCaptchaConfig;
    initAliyunCaptcha: InitAliyunCaptcha;
  }
}

export {}