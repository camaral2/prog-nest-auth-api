import { Global, Module, OnModuleInit } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthService } from '../auth/auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '../auth/auth.controller';
import { UserService } from '../user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { RtStrategy } from './rt.strategy';

import 'dotenv/config';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.SECREDT_KEY_AUTH,
      signOptions: { expiresIn: process.env.EXPIRESIN },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [AuthService, UserService, LocalStrategy, JwtStrategy, RtStrategy],
  controllers: [AuthController],
  exports: [PassportModule, AuthService],
})
export class AuthModule {}
