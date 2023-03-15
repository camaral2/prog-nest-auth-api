"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const user_controller_1 = require("./user.controller");
const user_service_1 = require("./user.service");
const userMock = {
    username: 'cristian.amaral',
    name: 'Cristian dos Santos Amaral',
    password: 'password_1234',
};
const listUserMock = [userMock, userMock];
const id = 'a0bd2189-971b-4ebd-bfba-44b7c8fa04c1';
const userUpdateDeleteMock = { result: { n: 1, ok: 1 } };
describe('UserController', () => {
    let controller;
    let service;
    beforeEach(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            controllers: [user_controller_1.UserController],
            providers: [
                user_service_1.UserService,
                {
                    provide: user_service_1.UserService,
                    useValue: {
                        create: jest.fn().mockResolvedValue(userMock),
                        findAll: jest.fn().mockResolvedValue(listUserMock),
                        findOne: jest.fn().mockResolvedValue(userMock),
                        findOneId: jest.fn().mockResolvedValue(userMock),
                        update: jest.fn().mockResolvedValue(userUpdateDeleteMock),
                        remove: jest.fn().mockResolvedValue(userUpdateDeleteMock),
                    },
                },
            ],
        }).compile();
        controller = moduleRef.get(user_controller_1.UserController);
        service = moduleRef.get(user_service_1.UserService);
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
            expect(ret).toMatchObject(listUserMock);
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
            const ret = await controller.update(id, userMock);
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
//# sourceMappingURL=user.controller.spec.js.map