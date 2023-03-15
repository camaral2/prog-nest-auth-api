import { OnModuleInit } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { returnDeleteUpdateT } from '@baseApi/shared/return-delete-update.type';
export declare class UserService implements OnModuleInit {
    private readonly usersRepository;
    constructor(usersRepository: Repository<User>);
    onModuleInit(): Promise<void>;
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(username: string): Promise<User>;
    findOneId(id: string): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<returnDeleteUpdateT>;
    remove(id: string): Promise<returnDeleteUpdateT>;
    updateRtHash(userName: string, rt: string): Promise<void>;
    updateRtLogout(userId: string): Promise<void>;
    private hashPassword;
}
