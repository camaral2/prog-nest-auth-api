import { Module } from '@nestjs/common';
import { UserModule } from '@baseApi/user/user.module';
import { AuthService } from '@baseApi/auth/auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '@baseApi/auth/auth.controller';
import { UserService } from '@baseApi/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@baseApi/user/entities/user.entity';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { RtStrategy } from './rt.strategy';

import 'dotenv/config';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [AuthService, UserService, LocalStrategy, JwtStrategy, RtStrategy],
  controllers: [AuthController],
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}
