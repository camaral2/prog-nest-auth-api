/* istanbul ignore file */
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import 'dotenv/config';
import { UserService } from '../user/user.service';
import { RequestUserDto } from './dto/request-user.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: process.env.JWT_IGNORE_EXPIRATION == 'true',
      secretOrKey: process.env.SECREDT_KEY_AUTH,
    });
  }

  async validate(payload: any): Promise<RequestUserDto> {
    const user = await this.userService.findOne(payload.username);

    if (!user) {
      throw new UnauthorizedException();
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User not is active');
    }

    const ret: RequestUserDto = {
      id: user._id,
      username: user.username,
      name: user.name,
    };

    return ret;
  }
}
