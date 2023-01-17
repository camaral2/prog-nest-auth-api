import { UserService } from '../user/user.service';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserDto } from '../auth/dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { payloadToken } from './types/payload-token.type';
import { tokens } from './types/tokens-types';
import * as uuid from 'uuid';
import * as argon from 'argon2';
import { tokensLogin } from './types/tokensLogin-types';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(login: LoginUserDto): Promise<User> {
    const user = await this.userService.findOne(login.username);

    if (!user) {
      throw new UnauthorizedException({
        message: 'User not found',
      });
    }

    // compare passwords
    const passwordValid = await bcrypt.compare(
      login.password + login.username,
      user.password,
    );

    if (!passwordValid) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
      });
    }

    //delete user.password;

    return user;
  }

  async login(userLogin: LoginUserDto): Promise<tokensLogin> {
    const user = await this.userService.findOne(userLogin.username);
    if (!user) {
      throw new ForbiddenException('Access Denied');
    } else {
      if (!user.isActive) {
        throw new ForbiddenException('Access Denied - User not is active');
      } else {
        // generate and sign token
        const token = this.createToken(user.username);

        await this.userService.updateRtHash(user.username, token.refresh_token);

        return {
          id: user._id,
          username: user.username,
          token: token,
        };
      }
    }
  }

  async logout(userId: string): Promise<boolean> {
    await this.userService.updateRtLogout(userId);
    return true;
  }

  async refreshTokens(userName: string, rt: string): Promise<tokensLogin> {
    const user = await this.userService.findOne(userName);

    if (!user || !user.hashedRt) {
      throw new ForbiddenException('Access Denied');
    } else {
      if (!user.isActive) {
        throw new ForbiddenException('Access Denied - User not is active');
      } else {
        const rtMatches = await argon.verify(user.hashedRt, rt);
        if (!rtMatches) {
          throw new ForbiddenException('Access Denied - No Matches');
        } else {
          const token = await this.createToken(user.username);
          await this.userService.updateRtHash(
            user.username,
            token.refresh_token,
          );

          return {
            id: user._id,
            username: user.username,
            token: token,
          };
        }
      }
    }
  }

  async validateToken(jwt: string) {
    return await this.jwtService.verify(jwt);
  }

  private createToken(userName: string): tokens {
    const identific: string = uuid.v4();
    const payload: payloadToken = { username: userName, identific };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.SECREDT_KEY_AUTH,
      expiresIn: process.env.EXPIRESIN,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.SECREDT_KEY_REFRESH,
      expiresIn: process.env.EXPIRESIN_REFRESH,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
