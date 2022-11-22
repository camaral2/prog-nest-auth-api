import { HttpExceptionFilter } from '@baseApi/shared/filter';
import {
  Controller,
  Post,
  UseGuards,
  Body,
  UseFilters,
  UsePipes,
  ValidationPipe,
  Logger,
  HttpStatus,
  HttpCode,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { LocalAuthGuard } from './local-auth.guard';
import { MessagePattern } from '@nestjs/microservices';
import { tokens } from './types/tokens-types';
import { RtGuard } from './rt-auth.guard';

@ApiBearerAuth()
@ApiTags('auth')
@Controller('auth')
@UseFilters(new HttpExceptionFilter())
@UsePipes(new ValidationPipe())
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login user' })
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Body() login: LoginUserDto): Promise<tokens> {
    return this.authService.login(login);
  }

  @MessagePattern({ role: 'auth', cmd: 'check' })
  async loggedIn(data) {
    try {
      const res = this.authService.validateToken(data.jwt);

      return res;
    } catch (e) {
      Logger.log(e);
      return false;
    }
  }

  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @MessagePattern({ role: 'auth', cmd: 'refresh' })
  refreshTokens(@Req() request: any): Promise<tokens> {
    const jwt = request.headers.authorization.replace('Bearer ', '');

    return this.authService.refreshTokens(request.user.username, jwt);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Body() user: any): Promise<boolean> {
    if (user.id) return this.authService.logout(user.id);
  }
}
