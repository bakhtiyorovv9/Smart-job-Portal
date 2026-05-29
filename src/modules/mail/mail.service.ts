import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailer: MailerService,
    private readonly config: ConfigService,
  ) {}

  async sendActivation(email: string, full_name: string, userId: number) {
    const appUrl =
      this.config.get<string>('APP_URL') || 'http://localhost:4000';
    const activationLink = `${appUrl}/auth/activate/${userId}`;

    try {
      await this.mailer.sendMail({
        to: email,
        subject: '✉️ Akkauntingizni faollashtiring',
        template: 'activation',
        context: { full_name, activationLink },
      });
      this.logger.log(`Activation email sent to ${email}`);
    } catch (err: any) {
      this.logger.error(`Failed to send activation email: ${err.message}`);
    }
  }

  async sendPasswordReset(
    email: string,
    full_name: string,
    resetToken: string,
  ) {
    const appUrl =
      this.config.get<string>('APP_URL') || 'http://localhost:4000';
    const resetLink = `${appUrl}/auth/reset-password?token=${resetToken}`;

    try {
      await this.mailer.sendMail({
        to: email,
        subject: '🔑 Parolni tiklash',
        template: 'reset-password',
        context: { full_name, resetLink },
      });
      this.logger.log(`Reset email sent to ${email}`);
    } catch (err: any) {
      this.logger.error(`Failed to send reset email: ${err.message}`);
    }
  }

  async sendApplicationStatus(
    email: string,
    full_name: string,
    vacancyTitle: string,
    status: string,
  ) {
    try {
      await this.mailer.sendMail({
        to: email,
        subject: `📨 Arizangiz holati: ${status}`,
        template: 'application-status',
        context: { full_name, vacancyTitle, status },
      });
      this.logger.log(`Status email sent to ${email}`);
    } catch (err: any) {
      this.logger.error(`Failed to send status email: ${err.message}`);
    }
  }
  async sendOtp(email: string, full_name: string, code: string) {
    try {
      await this.mailer.sendMail({
        to: email,
        subject: '🔐 Tasdiqlash kodi',
        template: 'otp',
        context: { full_name, code },
      });
      this.logger.log(`OTP sent to ${email}`);
    } catch (err: any) {
      this.logger.error(`Failed to send OTP: ${err.message}`);
    }
  }
}
