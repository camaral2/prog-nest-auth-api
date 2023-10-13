import { returnDeleteUpdateT } from '@baseApi/shared/return-delete-update.type';
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const userMock = {
  username: 'cristian.amaral',
  name: 'Cristian dos Santos Amaral',
  password: 'password_1234',
};

const retListUserMock = { countPage: 1, users: [userMock, userMock] };
const id = 'a0bd2189-971b-4ebd-bfba-44b7c8fa04c1';

const userUpdateDeleteMock: returnDeleteUpdateT = { result: { n: 1, ok: 1 } };

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: UserService,
          useValue: {
            create: jest.fn().mockResolvedValue(userMock),
            findAll: jest.fn().mockResolvedValue(retListUserMock),
            findOne: jest.fn().mockResolvedValue(userMock),
            findOneId: jest.fn().mockResolvedValue(userMock),
            update: jest.fn().mockResolvedValue(userUpdateDeleteMock),
            remove: jest.fn().mockResolvedValue(userUpdateDeleteMock),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get<UserController>(UserController);
    service = moduleRef.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Post user', () => {
    it('Should add new user', async () => {
      const ret = await controller.create(userMock);

      expect(service.create).toHaveBeenCalled();
      expect(ret).toMatchObject(userMock);
      expect(service.create).toHaveBeenCalledWith(userMock);
    });
  });

  describe('Get User', () => {
    it('Should return a list of users', async () => {
      const ret = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(ret).toMatchObject(retListUserMock);
    });

    it('Should return an user', async () => {
      const ret = await controller.findOne('cristian.amaral');

      expect(service.findOne).toHaveBeenCalled();
      expect(ret).toMatchObject(userMock);
    });

    it('Should return an user for Id', async () => {
      const ret = await controller.findOneId(id);

      expect(service.findOneId).toHaveBeenCalled();
      expect(ret).toMatchObject(userMock);
    });
  });

  describe('Update e Delete User', () => {
    it('Should update an user', async () => {
      const ret = await controller.update(id, userMock as UpdateUserDto);

      expect(service.update).toHaveBeenCalled();
      expect(ret).toMatchObject(userUpdateDeleteMock);
    });
    it('Should delete an user', async () => {
      const ret = await controller.remove(id);

      expect(service.remove).toHaveBeenCalled();
      expect(ret).toMatchObject(userUpdateDeleteMock);
    });
  });
});
