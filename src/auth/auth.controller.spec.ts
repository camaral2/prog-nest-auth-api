import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { tokensLogin } from './types/tokensLogin-types';

const loginPar: LoginUserDto = { username: 'cristian.amaral', password: '123' };
const tokensLoginMock: tokensLogin = {
  id: '9e048358-809e-11ed-a1eb-0242ac120002',
  token: {
    access_token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    refresh_token:
      'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTY3MTU2NTMzNywiaWF0IjoxNjcxNTY1MzM3fQ.PHWILkj9inM3FAwjnPazPAeDK3PiaW6SG-NgcK87r1I',
  },
  username: 'cristian.amaral',
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue(tokensLoginMock),
            validateToken: jest.fn().mockResolvedValue(true),
            refreshTokens: jest.fn().mockResolvedValue(true),
            logout: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('Should login an user', async () => {
    const ret = await controller.login(loginPar);

    expect(service.login).toHaveBeenCalled();
    expect(ret).toMatchObject(tokensLoginMock);
  });

  it('Should loggedIn a token', async () => {
    const ret = await controller.loggedIn({
      jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNyaXN0aWFuLmFtYXJhbCIsImlkZW50aWZpYyI6IjlmZjhlMzIzLTkxNDUtNDk2MS04ZjNlLTJmNjdlYzhlZjhlMSIsImlhdCI6MTY2OTQyNzAwNywiZXhwIjoxNjY5NDI3MDY3fQ.fWNADu89YGMgyccB8lZz8_aukCnN7NCOgbggkMH7iSg',
    });

    expect(service.validateToken).toHaveBeenCalled();
    expect(ret).toEqual(true);
  });

  it('Should loggedIn a token with error', async () => {
    const spyError = jest
      .spyOn(service, 'validateToken')
      .mockRejectedValue(new Error('InvalidToken'));

    try {
      await controller.loggedIn({ jwt: 'xxxxx' });
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }

    //await expect(controller.loggedIn('')).rejects.toThrowError('There');
    //await expect(controller.loggedIn('')).rejects.toThrow(HttpException);

    expect(service.validateToken).toHaveBeenCalled();
    expect(spyError).toHaveBeenCalled();
  });

  it('Should Refresh a token', async () => {
    const ret = await controller.refreshTokens({
      user: { username: 'cristian.amaral' },
      headers: {
        authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNyaXN0aWFuLmFtYXJhbCIsImlkZW50aWZpYyI6ImU2OTU2ZjZkLTI5MDUtNDNhNi05ZTZjLTkxYzM5ZjExZjQ2YyIsImlhdCI6MTY2ODY1NzUxMCwiZXhwIjoxNjY5MDg5NTEwfQ.75ReyhUhD2KrzZ1kVmUKpgMeoaYxg12tpOpxhMa9dsU',
      },
    });

    expect(service.refreshTokens).toHaveBeenCalled();
    expect(ret).toEqual(true);
  });

  it('Should logout', async () => {
    const ret = await controller.logout({
      id: '6250cf24-c33e-4d0a-9130-a0362ff64221',
    });

    expect(service.logout).toHaveBeenCalled();
    expect(ret).toEqual(true);
  });
});
