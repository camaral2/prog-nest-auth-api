//https://circleci.com/blog/getting-started-with-nestjs-and-automatic-testing/
//https://izolabs.tech/2022/07/customer-module
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { faker } from '@faker-js/faker';
import * as uuid from 'uuid';

const userTest = {
  username: faker.internet.userName(),
  name: faker.name.fullName(),
  password: faker.internet.password(),
};

const userMock = {
  _id: uuid.v4(),
  username: userTest.username.trim().toLowerCase(),
  name: userTest.name,
  password: '$2b$10$dTexEnPYamIl5jPhjB8F8ONcZoF47I0g/aC2Jcp0MTQUcKFHGIy6y',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const listUserMock = [userMock, userMock];

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

  const mockUserRepository = () => ({
    find: jest.fn().mockReturnValue(listUserMock),
    create: jest.fn().mockReturnValue(userMock),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    //userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userRepository = await module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Insert User', () => {
    it('should insert new User', async () => {
      const userRet = await service.create(userTest);

      expect(userRepository.create).toBeCalled();

      expect(userRet._id).toBeDefined();
      expect(userRet._id).not.toBeNull();
      expect(userRet.username).toEqual(userTest.username.toLocaleLowerCase());
      expect(userRet.name).toEqual(userTest.name);

      expect(userRet.password).toBeDefined();
      expect(userRet.password).not.toEqual(userTest.password);

      expect(userRet.createdAt).toBeDefined();
      expect(userRet.updatedAt).toBeDefined();
    });

    it('Should return user-already-exists exception', async () => {
      const spyError = jest
        .spyOn(service, 'create')
        .mockRejectedValue(new Error('User already exists'));

      await expect(service.create(userTest)).rejects.toThrow(
        new UnauthorizedException({
          message: 'User already exists',
        }),
      );

      expect(service.create).toHaveBeenCalled();
      expect(spyError).toHaveBeenCalled();
    });
  });

  describe('Find user', () => {
    it('Should return an user', async () => {
      const ret = await service.findAll();

      expect(userRepository.find).toBeCalled();

      expect(ret).toEqual(listUserMock);
    });
  });
});
