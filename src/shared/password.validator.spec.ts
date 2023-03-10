import { CreateUserDto } from '@baseApi/user/dto/create-user.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { faker } from '@faker-js/faker';

describe('Test of create user dto', () => {
  it('should throw when the password is empty', async () => {
    const dtoUser: CreateUserDto = {
      username: faker.internet.userName(),
      name: faker.name.fullName(),
      password: '',
    };
    const ofImportDto = plainToInstance(CreateUserDto, dtoUser);
    const errors = await validate(ofImportDto);
    expect(errors.length).not.toBe(0);
    expect(JSON.stringify(errors)).toContain('password should not be empty');
  });

  it('should throw when the password not is string', async () => {
    const user = {
      username: faker.internet.userName(),
      name: faker.name.fullName(),
      password: 3445,
    };

    const dtoUser: CreateUserDto = user as unknown as CreateUserDto;

    const ofImportDto = plainToInstance(CreateUserDto, dtoUser);
    const errors = await validate(ofImportDto);
    expect(errors.length).not.toBe(0);
    expect(JSON.stringify(errors)).toContain('Password not is string');
  });

  it('should throw when the password is too weak (1)', async () => {
    const dtoUser: CreateUserDto = {
      username: faker.internet.userName(),
      name: faker.name.fullName(),
      password: 'music',
    };
    const ofImportDto = plainToInstance(CreateUserDto, dtoUser);
    const errors = await validate(ofImportDto);
    expect(errors.length).not.toBe(0);
    expect(JSON.stringify(errors)).toContain('Password is too weak');
  });

  it('should throw when the password is too weak (2)', async () => {
    const dtoUser: CreateUserDto = {
      username: faker.internet.userName(),
      name: faker.name.fullName(),
      password: 'music123',
    };
    const ofImportDto = plainToInstance(CreateUserDto, dtoUser);
    const errors = await validate(ofImportDto);
    expect(errors.length).not.toBe(0);
    expect(JSON.stringify(errors)).toContain('Password is too weak');
  });

  it('should throw when the password is OK', async () => {
    const dtoUser: CreateUserDto = {
      username: faker.internet.userName(),
      name: faker.name.fullName(),
      password: 'music!123',
    };
    const ofImportDto = plainToInstance(CreateUserDto, dtoUser);
    const errors = await validate(ofImportDto);
    expect(errors.length).toBe(0);
  });
});
