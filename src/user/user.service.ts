import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as argon from 'argon2';
import * as uuid from 'uuid';
import { returnDeleteUpdateT } from '@baseApi/shared/return-delete-update.type';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async onModuleInit(): Promise<void> {
    const users = await this.findAll();

    if (users.length == 0 || !users || users == undefined || users == null) {
      try {
        await this.create({
          username: 'cristian.amaral',
          name: 'Cristian dos Santos Amaral',
          password: 'teste_12',
        });
      } catch (error) {
        console.dir(error);
      }
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User(createUserDto);

    user._id = uuid.v4();
    user.username = createUserDto.username.toLowerCase().trim();
    user.isActive = true;
    user.password = await this.hashPassword(createUserDto);

    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    const arr = await this.usersRepository.find();
    arr.forEach((object) => {
      delete object.password;
      delete object.hashedRt;
    });
    return arr;
  }

  async findOneLogin(username: string): Promise<User> {
    if (!username || username.trim().length === 0 || username == undefined)
      throw new BadRequestException('username is empty');

    const user = await this.usersRepository.findOneBy({
      username: username.toLowerCase().trim(),
    });

    return user;
  }

  async findOne(username: string): Promise<User> {
    if (!username || username.trim().length === 0 || username == undefined)
      throw new BadRequestException('username is empty');

    const user = await this.usersRepository.findOneBy({
      username: username.toLowerCase().trim(),
    });

    //if (!user) throw new NotFoundException(`Username not found: (${username})`);

    //delete user.password;
    return user;
  }

  async findOneId(id: string): Promise<User> {
    if (!id || id == undefined) throw new BadRequestException('id is empty');

    const user = await this.usersRepository.findOne({ where: { _id: id } });
    if (!user) throw new NotFoundException(`Id not found: (${id})`);

    //delete user.password;
    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<returnDeleteUpdateT> {
    const user = await this.findOneId(id);

    user.name = updateUserDto.name;
    user.isActive = updateUserDto.isActive;

    const ret = await this.usersRepository.update(id, user);

    if (ret.affected > 0) return { result: ret.raw.result };
    else throw new BadRequestException('user not updated');
  }

  async remove(id: string): Promise<returnDeleteUpdateT> {
    const ret = await this.usersRepository.delete({ _id: id });
    if (ret.affected > 0) {
      return { result: ret.raw.result };
    } else throw new BadRequestException('user not deleted');
  }

  async updateRtHash(userName: string, rt: string): Promise<void> {
    const hashRt = await argon.hash(rt);

    await this.usersRepository.update(
      { username: userName },
      { hashedRt: hashRt },
    );
  }

  async updateRtLogout(userId: string): Promise<void> {
    await this.usersRepository.update({ _id: userId }, { hashedRt: null });
  }

  private async hashPassword(user: CreateUserDto): Promise<string> {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(user.password + user.username, saltOrRounds);
    return hash;
  }
}
