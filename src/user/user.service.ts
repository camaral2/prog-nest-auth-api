import {
  BadRequestException,
  Injectable,
  NotFoundException,
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
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.dtoToUser(createUserDto, null);
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

    if (!user) throw new NotFoundException(`Username not found: (${username})`);

    delete user.password;
    return user;
  }

  async findOneId(id: string): Promise<User> {
    if (!id || id == undefined) throw new BadRequestException('id is empty');

    const user = await this.usersRepository.findOne({ where: { _id: id } });
    if (!user) throw new NotFoundException(`Id not found: (${id})`);

    delete user.password;
    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<returnDeleteUpdateT> {
    const userFind = await this.findOneId(id);
    const user = await this.dtoToUser(updateUserDto as CreateUserDto, userFind);

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

  private async dtoToUser(
    userDto: CreateUserDto,
    userObj: User,
  ): Promise<User> {
    let user: User;

    if (userObj) user = userObj as User;
    else {
      user = User.create();
      user._id = uuid.v4();
    }

    user.username = userDto.username.toLowerCase().trim();
    user.name = userDto.name;
    user.password = await this.hashPassword(userDto);

    if (user.isActive == undefined) user.isActive = true;

    return user;
  }
}
