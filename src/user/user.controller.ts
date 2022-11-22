//https://github.com/jmcdo29/testing-nestjs/blob/main/apps/mongo-sample/src/cat/cat.controller.spec.ts
//https://blog.logrocket.com/end-end-testing-nestjs-typeorm/
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  UseFilters,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from '@baseApi/shared/filter';
import { returnDeleteUpdateT } from '@baseApi/shared/return-delete-update.type';
import { JwtAuthGuard } from '@baseApi/auth/jwt.auth-guard';

@ApiBearerAuth()
@ApiTags('user')
@Controller('user')
@UseFilters(new HttpExceptionFilter())
@UsePipes(new ValidationPipe())
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create user' })
  //@UsePipes(new SanitizePipe(CreateUserDto))
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':username')
  findOne(@Param('username') username: string): Promise<User> {
    return this.userService.findOne(username);
  }

  @Get('Id/:id')
  findOneId(@Param('id', new ParseUUIDPipe()) id: string): Promise<User> {
    return this.userService.findOneId(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<returnDeleteUpdateT> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<returnDeleteUpdateT> {
    return this.userService.remove(id);
  }
}
