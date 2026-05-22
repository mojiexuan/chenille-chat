import { BizCode } from "@/enumeration";

/**
 * 业务异常
 */
export class BizException extends Error {

    readonly bizCode: BizCode;

    constructor(bizCode: BizCode, message?: string) {
        super(message || bizCode.message);
        this.bizCode = bizCode;
    }
}