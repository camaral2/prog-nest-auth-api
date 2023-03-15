import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { returnDeleteUpdateT } from '../shared/return-delete-update.type';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(username: string): Promise<User>;
    findOneId(id: string): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<returnDeleteUpdateT>;
    remove(id: string): Promise<returnDeleteUpdateT>;
}
