//52,77,83
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
import { syncBuiltinESMExports } from 'module';
import * as argon from 'argon2';
import * as uuid from 'uuid';

describe('AuthService', () => {
  let service: AuthService;
  let repositoryMock: Repository<User>;
  let jwtService: JwtService;

  const userName = faker.internet.userName().toLocaleLowerCase();
  const passWord = faker.internet.password();
  const rt = faker.random.alphaNumeric(30);

  let hash;
  let newHashedRt;

  beforeEach(async () => {
    const saltOrRounds = 10;

    if (!hash) hash = await bcrypt.hash(passWord + userName, saltOrRounds);
    if (!newHashedRt) newHashedRt = await argon.hash(rt);

    const oneUser = {
      _id: await uuid.v4(),
      username: userName,
      password: hash,
      name: faker.name.fullName(),
      isActive: true,
      hashedRt: newHashedRt,
    };

    process.env = {
      SECREDT_KEY_AUTH: 'B398_cv_pp!12df',
      EXPIRESIN: '60s',
      SECREDT_KEY_REFRESH: 'Hj+=Y:Zut87Yy09w1',
      EXPIRESIN_REFRESH: '5d',
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
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repositoryMock = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get(JwtService);
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
      //expect(userRet.password).toBeUndefined();
    });

    it('should return then error by username invalid authentication', async () => {
      const login: LoginUserDto = {
        username: 'NoExistsThisUserName',
        password: passWord,
      };

      const findSpyNotExists = jest
        .spyOn(repositoryMock, 'findOneBy')
        .mockImplementationOnce(() => Promise.resolve(null));

      const userRet = await expect(service.validateUser(login)).rejects.toThrow(
        new UnauthorizedException({
          message: 'User not found',
        }),
      );
      expect(findSpyNotExists).toBeCalled();

      expect(userRet).toBeUndefined();
    });

    it('should return then error by password invalid authentication', async () => {
      const login: LoginUserDto = {
        username: userName,
        password: '12345678',
      };

      const userRet = await expect(service.validateUser(login)).rejects.toThrow(
        new UnauthorizedException({
          message: 'Invalid credentials',
        }),
      );

      expect(repositoryMock.findOneBy).toBeCalled();
      expect(userRet).toBeUndefined();
    });
  });

  describe('Login Valid', () => {
    it('should login user with valid credentials', async () => {
      const hashSpy = jest
        .spyOn(argon, 'hash')
        .mockImplementation(() => Promise.resolve(''));

      const login: LoginUserDto = { username: userName, password: passWord };

      const loginRet = await service.login(login);
      expect(repositoryMock.findOneBy).toBeCalled();
      expect(repositoryMock.update).toBeCalled();
      expect(hashSpy).toBeCalled();

      expect(loginRet.username).toEqual(userName);
      expect(loginRet.token.access_token).toBeDefined();
      expect(loginRet.token.refresh_token).toBeDefined();
    });

    it('should login user with dont have user', async () => {
      const hashSpy = jest
        .spyOn(argon, 'hash')
        .mockImplementation(() => Promise.resolve(''));

      const findNullSpy = jest
        .spyOn(repositoryMock, 'findOneBy')
        .mockResolvedValue(null);

      const login: LoginUserDto = { username: userName, password: passWord };

      await expect(service.login(login)).rejects.toThrow(
        new UnauthorizedException({
          message: 'Access Denied',
        }),
      );

      expect(hashSpy).toBeCalled();
      expect(findNullSpy).toBeCalled();
    });

    it('should login user with user not active for valid credentials', async () => {
      const hashSpy = jest
        .spyOn(argon, 'hash')
        .mockImplementation(() => Promise.resolve(''));

      const oneUserInactive = {
        username: userName,
        password: hash,
        name: faker.name.fullName(),
        isActive: false,
      };
      const findSpy = jest
        .spyOn(repositoryMock, 'findOneBy')
        .mockResolvedValue(oneUserInactive as User);

      const login: LoginUserDto = { username: userName, password: passWord };

      await expect(service.login(login)).rejects.toThrow(
        new UnauthorizedException({
          message: 'Access Denied - User not is active',
        }),
      );

      expect(hashSpy).toBeCalled();
      expect(findSpy).toBeCalled();
    });
  });

  describe('Logout', () => {
    it('should logout user', async () => {
      await service.logout('');
      expect(repositoryMock.update).toBeCalled();
    });
  });

  describe('RefreshToken', () => {
    it('should refresh token user with valid credentials', async () => {
      const retRefresh = await service.refreshTokens(userName, rt);
      expect(repositoryMock.findOneBy).toBeCalled();
      expect(repositoryMock.update).toBeCalled();

      expect(retRefresh.id).toBeDefined();
      expect(retRefresh.username).toEqual(userName);
      expect(retRefresh.token.access_token).toBeDefined();
      expect(retRefresh.token.refresh_token).toBeDefined();
    });

    it('should refresh token with dont have user', async () => {
      const findNullSpy = jest
        .spyOn(repositoryMock, 'findOneBy')
        .mockResolvedValue(null);

      await expect(service.refreshTokens(userName, rt)).rejects.toThrow(
        new UnauthorizedException({
          message: 'Access Denied',
        }),
      );

      expect(findNullSpy).toBeCalled();
    });

    it('should refresh token with invalid Hash', async () => {
      await expect(
        service.refreshTokens(userName, 'InvalidHashInParameter'),
      ).rejects.toThrow(
        new UnauthorizedException({
          message: 'Access Denied - No Matches',
        }),
      );
    });

    it('should refresh token user not active and return error', async () => {
      const oneUserInactive = {
        username: userName,
        password: hash,
        name: faker.name.fullName(),
        isActive: false,
        hashedRt: newHashedRt,
      };

      const findSpy = jest
        .spyOn(repositoryMock, 'findOneBy')
        .mockResolvedValue(oneUserInactive as User);

      await expect(service.refreshTokens(userName, rt)).rejects.toThrow(
        new UnauthorizedException({
          message: 'Access Denied - User not is active',
        }),
      );

      expect(findSpy).toBeCalled();
    });
  });
  describe('ValidateToken', () => {
    it('should validate token invalid and return error', async () => {
      const validateSpy = jest
        .spyOn(jwtService, 'verify')
        .mockImplementationOnce(() => Promise.resolve());

      await service.validateToken(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNyaXN0aWFuLmFtYXJhbCIsImlkZW50aWZpYyI6ImU2OTU2ZjZkLTI5MDUtNDNhNi05ZTZjLTkxYzM5ZjExZjQ2YyIsImlhdCI6MTY2ODY1NzUxMCwiZXhwIjoxNjY5MDg5NTEwfQ.75ReyhUhD2KrzZ1kVmUKpgMeoaYxg12tpOpxhMa9dsU',
      );
      expect(validateSpy).toBeCalled();
    });
  });
});
