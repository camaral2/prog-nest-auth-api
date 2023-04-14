"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_entity_1 = require("@baseApi/user/entities/user.entity");
const user_service_1 = require("@baseApi/user/user.service");
const faker_1 = require("@faker-js/faker");
const jwt_1 = require("@nestjs/jwt");
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const auth_service_1 = require("./auth.service");
const common_1 = require("@nestjs/common");
const uuid = require("uuid");
const caCript = require("camaral-cript");
describe('AuthService', () => {
    let service;
    let repositoryMock;
    let jwtService;
    const userName = faker_1.faker.internet.userName().toLocaleLowerCase();
    const passWord = faker_1.faker.internet.password();
    const rt = faker_1.faker.random.alphaNumeric(30);
    let hash;
    let newHashedRt;
    beforeEach(async () => {
        const saltOrRounds = 10;
        if (!hash)
            hash = caCript.caCript(passWord + userName, process.env.SECREDT_KEY_AUTH).hash;
        if (!newHashedRt)
            newHashedRt = caCript.caCript(rt, process.env.SECREDT_KEY_REFRESH).hash;
        const oneUser = {
            _id: await uuid.v4(),
            username: userName,
            password: hash,
            name: faker_1.faker.name.fullName(),
            isActive: true,
            hashedRt: newHashedRt,
        };
        process.env = {
            SECREDT_KEY_AUTH: 'B398_cv_pp!12df',
            EXPIRESIN: '60s',
            SECREDT_KEY_REFRESH: 'Hj+=Y:Zut87Yy09w1',
            EXPIRESIN_REFRESH: '5d',
        };
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                jwt_1.JwtService,
                user_service_1.UserService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(user_entity_1.User),
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
        service = module.get(auth_service_1.AuthService);
        repositoryMock = module.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
        jwtService = module.get(jwt_1.JwtService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('when accessing the data of authenticating user', () => {
        it('should validate user by username with valid authentication ', async () => {
            const login = { username: userName, password: passWord };
            const userRet = await service.validateUser(login);
            expect(repositoryMock.findOneBy).toBeCalled();
            expect(userRet.username).toEqual(userName);
        });
        it('should return then error by username invalid authentication', async () => {
            const login = {
                username: 'NoExistsThisUserName',
                password: passWord,
            };
            const findSpyNotExists = jest
                .spyOn(repositoryMock, 'findOneBy')
                .mockImplementationOnce(() => Promise.resolve(null));
            const userRet = await expect(service.validateUser(login)).rejects.toThrow(new common_1.UnauthorizedException({
                message: 'User not found',
            }));
            expect(findSpyNotExists).toBeCalled();
            expect(userRet).toBeUndefined();
        });
        it('should return then error by password invalid authentication', async () => {
            const login = {
                username: userName,
                password: '12345678',
            };
            const userRet = await expect(service.validateUser(login)).rejects.toThrow(new common_1.UnauthorizedException({
                message: 'Invalid credentials',
            }));
            expect(repositoryMock.findOneBy).toBeCalled();
            expect(userRet).toBeUndefined();
        });
    });
    describe('Login Valid', () => {
        it('should login user with valid credentials', async () => {
            const login = { username: userName, password: passWord };
            const loginRet = await service.login(login);
            expect(repositoryMock.findOneBy).toBeCalled();
            expect(repositoryMock.update).toBeCalled();
            expect(loginRet.username).toEqual(userName);
            expect(loginRet.token.access_token).toBeDefined();
            expect(loginRet.token.refresh_token).toBeDefined();
        });
        it('should login user with dont have user', async () => {
            const findNullSpy = jest
                .spyOn(repositoryMock, 'findOneBy')
                .mockResolvedValue(null);
            const login = { username: userName, password: passWord };
            await expect(service.login(login)).rejects.toThrow(new common_1.UnauthorizedException({
                message: 'Access Denied',
            }));
            expect(findNullSpy).toBeCalled();
        });
        it('should login user with user not active for valid credentials', async () => {
            const oneUserInactive = {
                username: userName,
                password: hash,
                name: faker_1.faker.name.fullName(),
                isActive: false,
            };
            const findSpy = jest
                .spyOn(repositoryMock, 'findOneBy')
                .mockResolvedValue(oneUserInactive);
            const login = { username: userName, password: passWord };
            await expect(service.login(login)).rejects.toThrow(new common_1.UnauthorizedException({
                message: 'Access Denied - User not is active',
            }));
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
            await expect(service.refreshTokens(userName, rt)).rejects.toThrow(new common_1.UnauthorizedException({
                message: 'Access Denied',
            }));
            expect(findNullSpy).toBeCalled();
        });
        it('should refresh token with invalid Hash', async () => {
            await expect(service.refreshTokens(userName, 'InvalidHashInParameter')).rejects.toThrow(new common_1.UnauthorizedException({
                message: 'Access Denied - No Matches',
            }));
        });
        it('should refresh token user not active and return error', async () => {
            const oneUserInactive = {
                username: userName,
                password: hash,
                name: faker_1.faker.name.fullName(),
                isActive: false,
                hashedRt: newHashedRt,
            };
            const findSpy = jest
                .spyOn(repositoryMock, 'findOneBy')
                .mockResolvedValue(oneUserInactive);
            await expect(service.refreshTokens(userName, rt)).rejects.toThrow(new common_1.UnauthorizedException({
                message: 'Access Denied - User not is active',
            }));
            expect(findSpy).toBeCalled();
        });
    });
    describe('ValidateToken', () => {
        it('should validate token invalid and return error', async () => {
            const validateSpy = jest
                .spyOn(jwtService, 'verify')
                .mockImplementationOnce(() => Promise.resolve());
            await service.validateToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNyaXN0aWFuLmFtYXJhbCIsImlkZW50aWZpYyI6ImU2OTU2ZjZkLTI5MDUtNDNhNi05ZTZjLTkxYzM5ZjExZjQ2YyIsImlhdCI6MTY2ODY1NzUxMCwiZXhwIjoxNjY5MDg5NTEwfQ.75ReyhUhD2KrzZ1kVmUKpgMeoaYxg12tpOpxhMa9dsU');
            expect(validateSpy).toBeCalled();
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map