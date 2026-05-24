import Dypnsapi20170525, { SendSmsVerifyCodeRequest } from '@alicloud/dypnsapi20170525';
import { Config } from '@alicloud/openapi-client';
import Credential from '@alicloud/credentials';
import { config } from "@/config";
import { logger } from "@/utils";

class SmsService {
    private dysmsapiClient: Dypnsapi20170525;

    constructor() {
        this.dysmsapiClient = new Dypnsapi20170525(new Config(
            {
                credential: new Credential(),
                regionId: 'cn-chengdu',
                protocol: 'http',
                endpoint: 'dypnsapi.aliyuncs.com',
                accessKeyId: config.ALIBABA_CLOUD_SMS_ACCESS_KEY_ID,
                accessKeySecret: config.ALIBABA_CLOUD_SMS_ACCESS_KEY_SECRET,
            }
        ));
    }

    /**
     * 发送短信验证码
     * @param phone 手机号
     * @param code 验证码
     */
    async sendSmsCode(phone: string, code: string) {
        try {
            const request = new SendSmsVerifyCodeRequest({
                signName: '速通互联验证码',
                phoneNumber: phone,
                templateCode: '100001',
                templateParam: JSON.stringify({ code, min: 5 }),
            });
            const response = await this.dysmsapiClient.sendSmsVerifyCode(request);
            if (response.statusCode && response.statusCode === 200 && response.body && response.body.success) {
                return true;
            } else {
                logger.error({ err: response.body }, "短信验证码发送失败");
                return false;
            }
        } catch (err) {
            logger.error({ err: (err as Error).message }, "短信验证码发送失败");
            return false;
        }
    }
}

export { SmsService };