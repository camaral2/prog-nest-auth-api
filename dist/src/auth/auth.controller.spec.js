"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const testing_1 = require("@nestjs/testing");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const loginPar = { username: 'cristian.amaral', password: '123' };
const tokensLoginMock = {
    id: '9e048358-809e-11ed-a1eb-0242ac120002',
    token: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        refresh_token: 'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTY3MTU2NTMzNywiaWF0IjoxNjcxNTY1MzM3fQ.PHWILkj9inM3FAwjnPazPAeDK3PiaW6SG-NgcK87r1I',
    },
    username: 'cristian.amaral',
};
describe('AuthController', () => {
    let controller;
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [auth_controller_1.AuthController],
            providers: [
                auth_service_1.AuthService,
                {
                    provide: auth_service_1.AuthService,
                    useValue: {
                        login: jest.fn().mockResolvedValue(tokensLoginMock),
                        validateToken: jest.fn().mockResolvedValue(true),
                        refreshTokens: jest.fn().mockResolvedValue(true),
                        logout: jest.fn().mockResolvedValue(true),
                    },
                },
            ],
        }).compile();
        controller = module.get(auth_controller_1.AuthController);
        service = module.get(auth_service_1.AuthService);
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
        }
        catch (error) {
            expect(error).toBeInstanceOf(common_1.NotFoundException);
        }
        expect(service.validateToken).toHaveBeenCalled();
        expect(spyError).toHaveBeenCalled();
    });
    it('Should Refresh a token', async () => {
        const ret = await controller.refreshTokens({
            user: { username: 'cristian.amaral' },
            headers: {
                authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNyaXN0aWFuLmFtYXJhbCIsImlkZW50aWZpYyI6ImU2OTU2ZjZkLTI5MDUtNDNhNi05ZTZjLTkxYzM5ZjExZjQ2YyIsImlhdCI6MTY2ODY1NzUxMCwiZXhwIjoxNjY5MDg5NTEwfQ.75ReyhUhD2KrzZ1kVmUKpgMeoaYxg12tpOpxhMa9dsU',
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
//# sourceMappingURL=auth.controller.spec.js.map