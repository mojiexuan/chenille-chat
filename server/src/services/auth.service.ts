import { SmsService } from "./sms.service";
import type { Redis } from "ioredis";
import { CharType } from "@/enumeration";
import { randomStr } from "@/utils";
import { REDIS_SMS_PHONE_LOGIN_CODE_PREFIX } from "@/constants";

const SMS_RATE_PREFIX = "sms:rate:";
const SMS_CODE_TTL = 300;
const SMS_RATE_TTL = 60;

/**
 * 认证服务
 */
export class AuthService {
    constructor(
        private redis: Redis,
        private smsService: SmsService,
    ) { }

    /**
     * 生成手机号验证码
     * @returns 验证码
     */
    private generatePhoneCode(): string {
        return randomStr(6, CharType.Digit);
    }

    async sendPhoneCode(phone: string) {
        const rateKey = `${SMS_RATE_PREFIX}${phone}`;
    }
}
