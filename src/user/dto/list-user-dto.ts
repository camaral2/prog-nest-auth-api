import { User } from '../entities/user.entity';

export class ListUserDto {
  users: User[];
  countPage: number;
}
