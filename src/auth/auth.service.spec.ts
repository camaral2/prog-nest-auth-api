import { User } from '@baseApi/user/entities/user.entity';
import { UserService } from '@baseApi/user/user.service';
import { faker } from '@faker-js/faker';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RemoveOptions, Repository, SaveOptions } from 'typeorm';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let repositoryMock: Repository<User>;

  const userName = faker.internet.userName().toLocaleLowerCase();
  const passWord = faker.internet.password();

  beforeEach(async () => {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(passWord + userName, saltOrRounds);

    const oneUser = {
      username: userName,
      password: hash,
      name: faker.name.fullName(),
      isActive: true,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            new: jest.fn(),
            constructor: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn().mockResolvedValue(oneUser),
            create: jest.fn(),
            exec: jest.fn(),
            deleteOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repositoryMock = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when accessing the data of authenticating user', () => {
    it('should validate user by username with valid authentication ', async () => {
      const login: LoginUserDto = { username: userName, password: passWord };

      const userRet = await service.validateUser(login);
      expect(repositoryMock.findOneBy).toBeCalled();

      expect(userRet.username).toEqual(userName);
      expect(userRet.password).toBeUndefined();

      /*
      expect(userRet.id).toBeDefined();
      expect(userRet.username).toBeDefined();
      expect(userRet.accessToken).toBeDefined();
      expect(userRet.refreshToken).toBeDefined();

      id = res.body.id;
      jwtToken = res.body.accessToken;
      rtToken = res.body.refreshToken;

      expect(jwtToken).toMatch(
        /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/,
      ); // jwt regex
      expect(rtToken).toMatch(
        /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/,
      ); // jwt regex
      */
    });

    it('should return then error by username invalid authentication', async () => {
      const login: LoginUserDto = {
        username: 'NoExistsThisUserName',
        password: passWord,
      };

      const userRet = await expect(service.validateUser(login)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(repositoryMock.findOneBy).toBeCalled();

      expect(userRet).toBeUndefined();
    });
  });

  // describe('should login user with valid credentials', () => {
  // });
});
