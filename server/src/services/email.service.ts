import nodemailer from "nodemailer";
import { config } from "@/config";
import { logger } from "@/utils";

/**
 * 邮件服务
 */
export class EmailService {
  private transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: Number(config.SMTP_PORT),
      secure: Number(config.SMTP_PORT) === 465,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
    });
  }

  /**
   * 发送邮件
   * @param to 收件人邮箱
   * @param subject 邮件主题
   * @param html 邮件内容（HTML格式）
   * @returns 发送结果
   */
  async send(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: `"${config.APP_NAME}" <${config.SMTP_USER}>`,
        to,
        subject,
        html,
      });
      return true;
    } catch (err) {
      logger.error(err, "发送邮件失败");
      return false;
    }
  }
}
