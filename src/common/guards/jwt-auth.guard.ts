import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const token =
      req.signedCookies?.['accessToken'] ||
      req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token topilmadi');
    }

    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow<string>(
          'ACCESS_TOKEN_SECRET_KEY',
        ),
      });
      req.user = decoded;
      return true;
    } catch {
      throw new UnauthorizedException(
        'Yaroqsiz yoki muddati o\u2018tgan token',
      );
    }
  }
}
