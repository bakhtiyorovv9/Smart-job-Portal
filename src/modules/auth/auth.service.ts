import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import { User } from '../users/models/user.model';
import { Company } from '../companies/models/company.model';
import { MailService } from '../mail/mail.service';
import { SignUpDto } from './dtos/sign-up.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { UserRole } from '@/core/constants/constants';

interface JwtPayload {
  id: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Company) private readonly companyModel: typeof Company,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async register(payload: SignUpDto, res: Response) {
    const existing = await this.userModel.findOne({
      where: { email: payload.email },
    });
    if (existing) {
      throw new ConflictException(
        'Bu email allaqachon ro\u2018yxatdan o\u2018tgan',
      );
    }

    const hashedPass = await this.hashPass(payload.password);

    const otpCode = this.generateOtp();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    const user = await this.userModel.create({
      ...payload,
      password: hashedPass,
      otp_code: otpCode,
      otp_expires: otpExpires,
    });

    if (user.role === UserRole.COMPANY) {
      await this.companyModel.create({
        name: user.full_name,
        owner_id: user.id,
      } as any);
    }

    await this.mailService.sendOtp(user.email, user.full_name, otpCode);

    const tokens = await this.generateTokens({
      id: String(user.id),
      role: user.role,
    });
    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    const { password, otp_code, ...safe } = user.toJSON();

    return res.send({
      success: true,
      message: 'Ro\u2018yxatdan o\u2018tildi. Emailingizga kod yuborildi!',
      data: safe,
      accToken: tokens.accessToken,
      refToken: tokens.refreshToken,
    });
  }

  async login(payload: SignInDto, res: Response) {
    const user = await this.userModel.findOne({
      where: { email: payload.email },
    });
    if (!user) {
      throw new UnauthorizedException('Email yoki parol noto\u2018g\u2018ri');
    }

    const ok = await this.comparePass(payload.password, user.password);
    if (!ok) {
      throw new UnauthorizedException('Email yoki parol noto\u2018g\u2018ri');
    }

    const tokens = await this.generateTokens({
      id: String(user.id),
      role: user.role,
    });
    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    const { password, ...safe } = user.toJSON();

    return res.send({
      success: true,
      message: 'Tizimga kirildi',
      data: safe,
      accToken: tokens.accessToken,
      refToken: tokens.refreshToken,
    });
  }

  async refresh(req: Request, res: Response) {
    const token = req.signedCookies?.['RefreshToken'];
    if (!token) {
      throw new UnauthorizedException('Refresh token topilmadi');
    }

    let decoded: JwtPayload;
    try {
      decoded = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>(
          'REFRESH_TOKEN_SECRET_KEY',
        ),
      });
    } catch {
      throw new UnauthorizedException(
        'Yaroqsiz yoki muddati otgan token',
      );
    }

    const tokens = await this.generateTokens({
      id: decoded.id,
      role: decoded.role,
    });
    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    return res.send({
      success: true,
      accToken: tokens.accessToken,
      refToken: tokens.refreshToken,
    });
  }

  async logout(res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('RefreshToken');
    return res.send({ success: true, message: 'Tizimdan chiqildi' });
  }

  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ where: { email } });

    if (!user) {
      return {
        success: true,
        message:
          'Agar email ro\u2018yxatda bo\u2018lsa, tiklash havolasi yuborildi.',
      };
    }

    const resetToken = await this.jwtService.signAsync(
      { id: String(user.id), purpose: 'pw_reset' },
      {
        secret: this.configService.getOrThrow<string>(
          'ACCESS_TOKEN_SECRET_KEY',
        ),
        expiresIn: '15m',
      },
    );

    await this.mailService.sendPasswordReset(
      user.email,
      user.full_name,
      resetToken,
    );

    return {
      success: true,
      message: 'Tiklash havolasi emailingizga yuborildi.',
    };
  }

  async resetPassword(payload: ResetPasswordDto) {
    let decoded: { id: string; purpose?: string };
    try {
      decoded = await this.jwtService.verifyAsync(payload.token, {
        secret: this.configService.getOrThrow<string>(
          'ACCESS_TOKEN_SECRET_KEY',
        ),
      });
    } catch {
      throw new UnauthorizedException(
        'Token muddati o\u2018tgan yoki yaroqsiz',
      );
    }

    if (decoded.purpose !== 'pw_reset') {
      throw new UnauthorizedException('Yaroqsiz token');
    }

    const hashed = await this.hashPass(payload.newPassword);
    await this.userModel.update(
      { password: hashed },
      { where: { id: Number(decoded.id) } },
    );

    return { success: true, message: 'Parol yangilandi' };
  }

  async activate(userId: number) {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new UnauthorizedException('User topilmadi');
    }

    if (user.is_active) {
      return {
        success: true,
        message: 'Akkaunt allaqachon faollashtirilgan',
      };
    }

    await user.update({ is_active: true });
    return { success: true, message: 'Akkaunt faollashtirildi' };
  }

  async verifyOtp(email: string, code: string) {
    const user = await this.userModel.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Foydalanuvchi topilmadi');
    }

    if (user.is_active) {
      return { success: true, message: 'Akkaunt allaqachon faollashtirilgan' };
    }

    if (user.otp_code !== code) {
      throw new UnauthorizedException('Kod noto\u2018g\u2018ri');
    }

    if (!user.otp_expires || user.otp_expires < new Date()) {
      throw new UnauthorizedException(
        'Kod muddati o\u2018tgan. Qayta yuboring',
      );
    }

    await user.update({
      is_active: true,
      otp_code: null as any,
      otp_expires: null as any,
    });

    return { success: true, message: 'Akkaunt faollashtirildi! \u2705' };
  }

  async resendOtp(email: string) {
    const user = await this.userModel.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Foydalanuvchi topilmadi');
    }
    if (user.is_active) {
      return { success: true, message: 'Akkaunt allaqachon faol' };
    }

    const otpCode = this.generateOtp();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    await user.update({ otp_code: otpCode, otp_expires: otpExpires });
    await this.mailService.sendOtp(user.email, user.full_name, otpCode);

    return { success: true, message: 'Yangi kod yuborildi' };
  }

  private async hashPass(password: string) {
    return bcrypt.hash(password, 10);
  }

  private async comparePass(originalPass: string, hashedPassword: string) {
    return bcrypt.compare(originalPass, hashedPassword);
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';

    res.cookie('accessToken', accessToken, {
      signed: true,
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('RefreshToken', refreshToken, {
      signed: true,
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }

  private async generateTokens(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>(
          'ACCESS_TOKEN_SECRET_KEY',
        ),
        expiresIn: this.configService.getOrThrow<string>(
          'ACCESS_TOKEN_EXPIRE_TIME',
        ) as JwtSignOptions['expiresIn'],
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>(
          'REFRESH_TOKEN_SECRET_KEY',
        ),
        expiresIn: this.configService.getOrThrow<string>(
          'REFRESH_TOKEN_EXPIRE_TIME',
        ) as JwtSignOptions['expiresIn'],
      }),
    ]);
    return { accessToken, refreshToken };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
