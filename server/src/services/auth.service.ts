import { SmsService } from "./sms.service";
import type { Redis } from "ioredis";
import { CharType } from "@/enumeration";
import { randomStr } from "@/utils";
import jwt from "jsonwebtoken";
import { REDIS_SMS_PHONE_LOGIN_CODE_PREFIX, REDIS_SMS_PHONE_LOGIN_RATE_PREFIX } from "@/constants";
import { BizException } from "@/exception";
import { BizCode, LoginType, LoginStatus } from "@/enumeration";
import { db, loginLogs, users } from "@/db";
import { eq, max } from "drizzle-orm";
import { config } from "@/config";
import type { JwtPayload } from "@/types/jwt.type";

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
    private generatePhoneLoginCode(): string {
        return randomStr(6, CharType.Digit);
    }

    /**
     * 发送手机号验证码
     * @param phone 手机号
     */
    async sendPhoneLoginCode(phone: string) {
        const rateKey = `${REDIS_SMS_PHONE_LOGIN_RATE_PREFIX}${phone}`;
        if (await this.redis.get(rateKey)) {
            throw new BizException(BizCode.SMS_RATE_LIMIT);
        }
        const code = this.generatePhoneLoginCode();
        await this.redis.set(`${REDIS_SMS_PHONE_LOGIN_CODE_PREFIX}${phone}`, code, "EX", SMS_CODE_TTL);
        await this.redis.set(rateKey, "1", "EX", SMS_RATE_TTL);
        const success = await this.smsService.sendSmsCode(phone, code);
        if (!success) {
            throw new BizException(BizCode.SMS_SEND_FAIL);
        }
    }

    /**
     * 手机号验证码登录
     * @param phone 手机号
     * @param code 验证码
     */
    async phoneCodeLogin(phone: string, code: string, ip?: string, userAgent?: string) {
        const storedCode = await this.redis.get(`${REDIS_SMS_PHONE_LOGIN_CODE_PREFIX}${phone}`);
        if (!storedCode || storedCode !== code) {
            const [user] = await db.select({ id: users.id }).from(users).where(eq(users.phone, phone)).limit(1);
            if (user) {
                await this.loginLog({ userId: user.id, loginType: LoginType.Sms, status: LoginStatus.Fail, failReason: "验证码错误", ip, userAgent });
            }
            throw new BizException(BizCode.SMS_CODE_INVALID);
        }

        await this.redis.del(`${REDIS_SMS_PHONE_LOGIN_CODE_PREFIX}${phone}`);
        const [existingUser] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);

        let userId: number;

        if (!existingUser) {
            const [{ maxId }] = await db.select({ maxId: max(users.id) }).from(users);
            const username = String(100000000 + (maxId ?? 0) + 1);
            const [newUser] = await db.insert(users).values({
                phone,
                username,
                nickname: randomStr(4, CharType.Upper),
            }).returning({ id: users.id });
            userId = newUser.id;
        } else {
            userId = existingUser.id;
        }

        const token = jwt.sign({ userId } as JwtPayload, config.JWT_SECRET, {
            expiresIn: Number(config.JWT_EXPIRES_IN),
        });
        await this.loginLog({ userId, loginType: LoginType.Sms, status: LoginStatus.Success, failReason: "登录成功", ip, userAgent, token });

        return token;
    }

    /**
     * 记录登录日志
     * @param userId 用户ID
     * @param loginType 登录类型
     * @param ip IP地址
     * @param status 登录状态
     * @param failReason 失败原因
     * @param userAgent 用户代理
     * @param token 登录凭证
     */
    private async loginLog(
        params: {
            userId: number,
            loginType: LoginType,
            status: LoginStatus,
            failReason?: string,
            ip?: string,
            userAgent?: string,
            token?: string,
        }
    ) {
        await db.insert(loginLogs).values({
            userId: params.userId,
            loginType: params.loginType,
            ipAddress: params.ip,
            status: params.status,
            failReason: params.failReason ?? null,
            userAgent: params.userAgent ?? null,
            token: params.token ?? null,
        });
    }
}
