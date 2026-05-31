import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { User } from '../users/models/user.model';
import { Company } from '../companies/models/company.model';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthViewController } from './auth-view.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Company]),
    JwtModule.register({}),
    ConfigModule,
  ],
  controllers: [AuthController, AuthViewController],
  providers: [AuthService],
  exports: [AuthService, JwtModule, ConfigModule],
})
export class AuthModule {}
