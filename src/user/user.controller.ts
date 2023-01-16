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
import { HttpExceptionFilter } from '../shared/filter';
import { returnDeleteUpdateT } from '../shared/return-delete-update.type';
import { JwtAuthGuard } from '../auth/jwt.auth-guard';

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
  async findOne(@Param('username') username: string): Promise<User> {
    const ret = await this.userService.findOne(username);
    delete ret.password;
    return ret;
  }

  @Get('Id/:id')
  async findOneId(@Param('id', new ParseUUIDPipe()) id: string): Promise<User> {
    const ret = await this.userService.findOneId(id);
    delete ret.password;
    return ret;
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
