/**
 * 阿里云验证码配置
 */
export type AliyunCaptchaConfig = {
    region: "cn" | "sgp";
    prefix: string;
}

/**
 * 初始化阿里云验证码选项
 */
export type InitAliyunCaptchaOptions = {
    SceneId: string;
    mode: string;
    element: string;
    button: string;
    success: (captchaVerifyParam: string) => void;
    fail?: (result: string) => void;
    getInstance?: (instance:AliyunCaptchaInstance)=>void;
    slideStyle?:{
        width: number;
        height: number;
    };
    language?:"cn";
    timeout?:number;
    rem?:number;
    onError?: (error:Error)=>void;
    onClose?: (reason:string)=>void;
    captchaLogoImg?:string;
    dualStack?:boolean;
    UserCertifyId?:string;
    showErrorTip?:boolean;
    delayBeforeSuccess?:boolean;
    EncryptedSceneId?:string;
    zIndex?:number;
    disableMaskClick?:boolean;
}

/**
 * 初始化阿里云验证码
 */
export type InitAliyunCaptcha = (config: InitAliyunCaptchaOptions) => void;

/**
 * 阿里云验证码实例
 */
export type AliyunCaptchaInstance = {
    show: () => void; // 无痕验证模式下不支持
    hide: () => void; // 无痕验证模式下不支持
    startTracelessVerification: () => void; // 无痕验证模式下特有
};