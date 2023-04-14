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
import { CaCripto } from 'camaral-cript';

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
        console.log(error);
      }
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User(createUserDto);

    user._id = uuid.v4();
    user.username = createUserDto.username.toLowerCase().trim();
    user.isActive = true;
    user.password = await this.hashPassword(createUserDto);

    const ret = await this.usersRepository.save(user);
    return ret;
  }

  async findAll(): Promise<User[]> {
    //const arr = JSON.parse(JSON.stringify(await this.usersRepository.find()));
    //const arrBase = await this.usersRepository.find();
    //const arr = arrBase.slice();
    //const arr = Array.from(arrBase);
    //const arr = { ...arrBase };

    const arr = await this.usersRepository.find();

    arr.forEach((object) => {
      delete object.password;
      delete object.hashedRt;
    });

    return arr;
  }

  async findOne(username: string): Promise<User> {
    if (!username || username.trim().length === 0 || username == undefined)
      throw new BadRequestException('username is empty');

    const user = await this.usersRepository.findOneBy({
      username: username.toLowerCase().trim(),
    });

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
    user.updatedAt = new Date();

    const ret = await this.usersRepository.update({ _id: id }, user);

    if (ret.affected > 0)
      return { result: { n: ret.affected, ok: ret.affected } };
    else throw new BadRequestException('user not updated');
  }

  async remove(id: string): Promise<returnDeleteUpdateT> {
    const ret = await this.usersRepository.delete({ _id: id });
    if (ret.affected > 0) {
      return { result: { n: ret.affected, ok: ret.affected } };
    } else throw new BadRequestException('user not deleted');
  }

  async updateRtHash(userName: string, rt: string): Promise<void> {
    const hashRt = CaCripto(rt, process.env.SECREDT_KEY_REFRESH).hash;

    //console.log('Salvar');
    //console.log('Rt para Salvar:', rt);
    //console.log('hashRt Salvo..:', hashRt);
    //const hashRt = await argon.hash(rt);

    await this.usersRepository.update(
      { username: userName },
      { hashedRt: hashRt },
    );
  }

  async updateRtLogout(userId: string): Promise<void> {
    await this.usersRepository.update({ _id: userId }, { hashedRt: null });
  }

  private async hashPassword(user: CreateUserDto): Promise<string> {
    const hash = CaCripto(
      user.password + user.username,
      process.env.SECREDT_KEY_AUTH,
    ).hash;

    return hash;
  }
}

// function deepClone(original) {
//   if (original instanceof RegExp) {
//     return new RegExp(original);
//   } else if (original instanceof Date) {
//     return new Date(original.getTime());
//   } else if (Array.isArray(original)) {
//     return original.map(deepClone);
//   } else if (typeof original === 'object' && original !== null) {
//     const clone = {};
//     Object.keys(original).forEach((k) => {
//       clone[k] = deepClone(original[k]);
//     });
//     return clone;
//   }
//   return original;
// }
