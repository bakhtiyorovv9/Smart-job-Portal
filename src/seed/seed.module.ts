import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../modules/users/models/user.model';
import { SeedService } from './seed.service';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  providers: [SeedService],
})
export class SeedModule {}
