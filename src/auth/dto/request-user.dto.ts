/* istanbul ignore file */
import { IsNotEmpty } from 'class-validator';

export class RequestUserDto {
  @IsNotEmpty() readonly id: string;
  @IsNotEmpty() readonly username: string;
  @IsNotEmpty() readonly name: string;
}
