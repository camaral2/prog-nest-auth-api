import { ApiProperty } from '@nestjs/swagger';
import { IsPasswordValid } from '../../shared/password.validator';
//import { IsPasswordValid } from '@baseApi/shared/password.validator';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(30)
  readonly username: string;

  @ApiProperty()
  @IsString()
  @IsPasswordValid()
  @MinLength(6)
  @MaxLength(50)
  @IsNotEmpty()
  readonly password: string;

  @ApiProperty({ description: 'The Name of the User' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(100)
  readonly name: string;

  //@MaxLength(250)
  //@IsEmail()
  //@IsNotEmpty()
  //email: string;
}
