/* istanbul ignore file */
//https://stackoverflow.com/questions/67832906/unit-testing-nestjs-guards-unknown-authentication-strategy
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RequestUserDto } from './dto/request-user.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'username',
      passwordField: 'password',
    });
  }

  async validate(username: string, password: string): Promise<RequestUserDto> {
    const dtoLogin: LoginUserDto = {
      username: username,
      password: password,
    };

    const user = await this.authService.validateUser(dtoLogin);

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
