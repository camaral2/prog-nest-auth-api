//https://circleci.com/blog/getting-started-with-nestjs-and-automatic-testing/
//https://izolabs.tech/2022/07/customer-module
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { faker } from '@faker-js/faker';
import * as uuid from 'uuid';
import { UpdateUserDto } from './dto/update-user.dto';
import { Console } from 'console';

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

const listUserMock = [{ ...userMock }, { ...userMock }];

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

  const mockUserRepository = () => ({
    find: jest.fn(() => Promise.resolve(listUserMock)),
    findOne: jest.fn(() => Promise.resolve(userMock)),
    create: jest.fn(() => Promise.resolve(userMock)),
    save: jest.fn(() => Promise.resolve(userMock)),
    new: jest.fn().mockResolvedValue(userMock),
    constructor: jest.fn().mockResolvedValue(userMock),
    update: jest.fn(() => Promise.resolve(userMock)),
    delete: jest.fn(() => Promise.resolve(userMock)),
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
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('should Initializate', () => {
    it('should create user', async () => {
      const spyFind = jest
        .spyOn(userRepository, 'find')
        .mockImplementationOnce(() => Promise.resolve([]));

      await service.onModuleInit();

      expect(spyFind).toHaveBeenCalled();
      expect(userRepository.find).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should not create user', async () => {
      const listUserMock2: User[] = [{ ...userMock } as unknown as User];

      const spyFind = jest
        .spyOn(userRepository, 'find')
        .mockImplementationOnce(() => Promise.resolve(listUserMock2));

      await service.onModuleInit();

      expect(userRepository.find).toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(spyFind).toHaveBeenCalled();
    });

    it('should error', async () => {
      const errorFake = { message: 'Error Fake.' };

      const spyFindListError = jest
        .spyOn(userRepository, 'find')
        .mockImplementationOnce(() => Promise.resolve([]));

      const spyErrorFake = jest
        .spyOn(userRepository, 'save')
        .mockRejectedValue(errorFake);

      try {
        await service.onModuleInit();
      } catch (err) {
        expect(err).toMatchObject(errorFake);
      }

      expect(spyFindListError).toHaveBeenCalled();
      expect(spyErrorFake).toHaveBeenCalled();

      expect(userRepository.find).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
    });
  });

  describe('Insert User', () => {
    it('should insert new User', async () => {
      const userRet = await service.create(userTest);
      expect(userRepository.save).toBeCalled();

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
        .spyOn(userRepository, 'save')
        .mockRejectedValue(new Error('User already exists'));

      await expect(service.create(userTest)).rejects.toThrow(
        new UnauthorizedException({
          message: 'User already exists',
        }),
      );

      expect(userRepository.save).toHaveBeenCalled();
      expect(spyError).toHaveBeenCalled();
    });
  });

  describe('Find user of username', () => {
    it('Should return an user', async () => {
      const ret = await service.findAll();

      expect(userRepository.find).toBeCalled();
      expect(ret.length).toEqual(listUserMock.length);
    });

    it('Should return error when found with empty username', async () => {
      await expect(service.findOne('')).rejects.toThrow(
        new BadRequestException({
          message: 'username is empty',
        }),
      );
    });
  });

  describe('Find user of Id', () => {
    it('Should return an user', async () => {
      const ret = await service.findOneId(userMock._id);

      expect(userRepository.findOne).toBeCalled();
      expect(ret).toEqual(userMock);
    });

    it('Should return error when found Id not exists', async () => {
      const findSpyNotExists = jest
        .spyOn(userRepository, 'findOne')
        .mockImplementationOnce(() => Promise.resolve(null));

      await expect(service.findOneId('0000000000')).rejects.toThrow(
        new NotFoundException({
          message: 'Id not found: (0000000000)',
        }),
      );
      expect(findSpyNotExists).toBeCalled();
    });

    it('Should return error when found with empty Id', async () => {
      await expect(service.findOneId('')).rejects.toThrow(
        new BadRequestException({
          message: 'id is empty',
        }),
      );
      expect(userRepository.findOne).not.toBeCalled();
    });
  });

  describe('Update an user', () => {
    it('Should Update an user', async () => {
      const retSpyUpdate = new UpdateResult();
      retSpyUpdate.affected = 1;
      retSpyUpdate.raw = { result: userMock };

      jest.spyOn(userRepository, 'update').mockResolvedValueOnce(retSpyUpdate);

      const updateUser = new UpdateUserDto(userMock);
      const ret = await service.update(userMock._id, updateUser);

      expect(userRepository.findOne).toBeCalled();
      expect(userRepository.update).toBeCalled();
      expect(ret).toMatchObject(updateUser);
      expect(ret.result.n).toEqual(retSpyUpdate.affected);
    });

    it('Should return error when updated Id not exists', async () => {
      const retSpyUpdate = new UpdateResult();
      retSpyUpdate.affected = 0;

      jest.spyOn(userRepository, 'update').mockResolvedValueOnce(retSpyUpdate);

      const updateUser = new UpdateUserDto(userMock);
      await expect(service.update('0000000000', updateUser)).rejects.toThrow(
        new NotFoundException({
          message: 'user not updated',
        }),
      );
      expect(userRepository.findOne).toBeCalled();
      expect(userRepository.update).toBeCalled();
    });
  });

  describe('Delete an user', () => {
    it('Should delete an user', async () => {
      const retSpyDelete = new DeleteResult();
      retSpyDelete.affected = 1;
      retSpyDelete.raw = { result: userMock };

      jest.spyOn(userRepository, 'delete').mockResolvedValueOnce(retSpyDelete);

      const ret = await service.remove(userMock._id);

      expect(userRepository.delete).toBeCalled();
      expect(ret.result.n).toEqual(retSpyDelete.affected);
    });

    it('Should return error when updated Id not exists', async () => {
      const retSpyDelete = new DeleteResult();
      retSpyDelete.affected = 0;

      jest.spyOn(userRepository, 'delete').mockResolvedValueOnce(retSpyDelete);

      await expect(service.remove('0000000000')).rejects.toThrow(
        new NotFoundException({
          message: 'user not deleted',
        }),
      );
      expect(userRepository.delete).toBeCalled();
    });
  });
});
