import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { Request, Response, NextFunction } from 'express';
import { User } from '../../modules/users/models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(User) private readonly userModel: typeof User,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token =
      req.signedCookies?.['accessToken'] ||
      req.cookies?.['accessToken'] ||
      req.headers.authorization?.split(' ')[1];

    if (token) {
      try {
        const decoded = await this.jwtService.verifyAsync(token, {
          secret: this.configService.getOrThrow<string>(
            'ACCESS_TOKEN_SECRET_KEY',
          ),
        });

        const user = await this.userModel.findByPk(decoded.id, {
          attributes: { exclude: ['password'] },
        });

        if (user) {
          req.user = user.toJSON();
        }
      } catch {
        req.user = undefined;
      }
    }

    next();
  }
}
