import captcha20230305, * as Captcha from '@alicloud/captcha20230305';
import { Config } from '@alicloud/openapi-client';
import { config } from '@/config';

/**
 * 验证码服务
 */
class CaptchaService {

    private captchaClient: captcha20230305;

    constructor() {
        this.captchaClient = new captcha20230305(new Config({
            regionId: 'cn-shanghai',
            protocol: 'http',
            endpoint: 'captcha.cn-shanghai.aliyuncs.com',
            accessKeyId: config.ALIBABA_CLOUD_CAPTCHA_ACCESS_KEY_ID,
            accessKeySecret: config.ALIBABA_CLOUD_CAPTCHA_ACCESS_KEY_SECRET,
        }));
    }
}

export const captchaService = new CaptchaService();
