"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const request = require("supertest");
const app_module_1 = require("./../src/app.module");
const faker_1 = require("@faker-js/faker");
const filter_1 = require("@baseApi/shared/filter");
const update_user_dto_1 = require("@baseApi/user/dto/update-user.dto");
describe('AppController (e2e)', () => {
    let app;
    let api;
    let jwtToken;
    const username = 'cristian.amaral';
    const password = 'teste_12';
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new common_1.ValidationPipe());
        app.useGlobalFilters(new filter_1.HttpExceptionFilter());
        await app.init();
        api = app.getHttpServer();
    });
    afterAll(async () => {
        await app.close();
    });
    describe('POST /auth/login', () => {
        it('Should validate the payload', async () => {
            await request(api)
                .post('/auth/login')
                .send({})
                .expect(common_1.HttpStatus.UNAUTHORIZED);
        });
        it('should return Unauthorised on bad credentials', async () => {
            await request(api)
                .post('/auth/login')
                .send({ username, password: 'incorrect' })
                .expect(common_1.HttpStatus.UNAUTHORIZED);
        });
        it('should log a user in and return a JWT token', async () => {
            await request(api)
                .post('/auth/login')
                .send({ username, password })
                .expect(common_1.HttpStatus.CREATED)
                .expect((res) => {
                expect(res.body.username).toEqual(username);
                expect(res.body.password).toBeUndefined();
                expect(res.body.token.access_token).toBeDefined();
                jwtToken = res.body.token.access_token;
                expect(jwtToken).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/);
            });
        });
    });
    const createUserBody = () => {
        return {
            username: faker_1.faker.internet.userName(),
            name: faker_1.faker.name.fullName(),
            password: faker_1.faker.internet.password(10),
        };
    };
    const createInvalidUserBodies = () => {
        const validUser = createUserBody();
        return [
            undefined,
            {},
            { username: faker_1.faker.internet.userName(), password: validUser.password },
            { name: undefined, username: faker_1.faker.internet.userName(), password: validUser.password },
            { name: null, username: faker_1.faker.internet.userName(), password: validUser.password },
            { name: faker_1.faker.datatype.boolean(), username: faker_1.faker.internet.userName(), password: validUser.password },
            { name: faker_1.faker.datatype.number(), username: faker_1.faker.internet.userName(), password: validUser.password },
            { name: JSON.parse(faker_1.faker.datatype.json()), username: faker_1.faker.internet.userName(), password: validUser.password },
            { name: '', username: faker_1.faker.internet.userName(), password: validUser.password },
            { name: validUser.name, password: validUser.password },
            { username: undefined, name: validUser.name, password: validUser.password },
            { username: null, name: validUser.name, password: validUser.password },
            { username: faker_1.faker.datatype.boolean(), name: validUser.name, password: validUser.password },
            { username: faker_1.faker.datatype.number(), name: validUser.name, password: validUser.password },
            { username: JSON.parse(faker_1.faker.datatype.json()), name: validUser.name, password: validUser.password },
            { username: '', name: validUser.name, password: validUser.password },
            { name: validUser.name, username: faker_1.faker.internet.userName() },
            { password: undefined, name: validUser.name, username: faker_1.faker.internet.userName() },
            { password: null, name: validUser.name, username: faker_1.faker.internet.userName() },
            { password: faker_1.faker.datatype.boolean(), name: validUser.name, username: faker_1.faker.internet.userName() },
            { password: faker_1.faker.datatype.number(), name: validUser.name, username: faker_1.faker.internet.userName() },
            { password: JSON.parse(faker_1.faker.datatype.json()), name: validUser.name, username: faker_1.faker.internet.userName() },
            { password: '', name: validUser.name, username: faker_1.faker.internet.userName() },
            { password: faker_1.faker.word.noun(), name: validUser.name, username: faker_1.faker.internet.userName() },
        ];
    };
    const userValid = createUserBody();
    describe('Insert an user', () => {
        it('/ (POST)', async () => {
            const resp = await request(api)
                .post('/user')
                .send(userValid)
                .set('Authorization', `Bearer ${jwtToken}`)
                .expect(common_1.HttpStatus.CREATED);
            expect(resp.body._id).toBeDefined();
            expect(resp.body._id).not.toBeNull();
            expect(resp.body.username).toEqual(userValid.username.toLocaleLowerCase());
            expect(resp.body.name).toEqual(userValid.name);
            expect(resp.body.password).toBeDefined();
            expect(resp.body.password).not.toEqual(userValid.password);
        });
        it('/POST an user duplicate', async () => {
            await request(api)
                .post('/user')
                .send(userValid)
                .set('Authorization', `Bearer ${jwtToken}`)
                .expect(common_1.HttpStatus.CONFLICT)
                .expect(/duplicate key/);
        });
        describe('Should accept valid data', () => {
            const invalidData = createInvalidUserBodies();
            invalidData.forEach((payload) => {
                const payloadString = JSON.stringify(payload);
                it(`Invalid data (${payloadString})`, async () => {
                    const res = await request(api)
                        .post('/user')
                        .set('Authorization', `Bearer ${jwtToken}`)
                        .send(payload)
                        .expect(common_1.HttpStatus.BAD_REQUEST);
                    const resBody = res.body;
                    expect(resBody.error).toEqual(expect.arrayContaining([expect.any(String)]));
                });
            });
        });
    });
    describe('Find an user', () => {
        let _id;
        it('Found an user by username', async () => {
            const resp = await request(api)
                .get(`/user/${userValid.username}`)
                .set('Authorization', `Bearer ${jwtToken}`)
                .expect(common_1.HttpStatus.OK);
            expect(resp.body._id).toBeDefined();
            expect(resp.body._id).not.toBeNull();
            expect(resp.body.password).not.toBeDefined();
            expect(resp.body.username).toEqual(userValid.username.trim().toLocaleLowerCase());
            expect(resp.body.name).toEqual(userValid.name);
            expect(resp.body.createdAt).toBeDefined();
            expect(resp.body.updatedAt).toBeDefined();
            _id = resp.body._id;
        });
        it('Found an user by Id', async () => {
            const resp = await request(api)
                .get(`/user/Id/${_id}`)
                .set('Authorization', `Bearer ${jwtToken}`)
                .expect(common_1.HttpStatus.OK);
            expect(resp.body._id).toBeDefined();
            expect(resp.body._id).not.toBeNull();
            expect(resp.body._id).toEqual(_id);
            expect(resp.body.password).not.toBeDefined();
            expect(resp.body.username).toEqual(userValid.username.trim().toLocaleLowerCase());
            expect(resp.body.name).toEqual(userValid.name);
            expect(resp.body.createdAt).toBeDefined();
            expect(resp.body.updatedAt).toBeDefined();
        });
    });
    describe('Find all user', () => {
        it('Found all user', async () => {
            const resp = await request(api)
                .get(`/user`)
                .set('Authorization', `Bearer ${jwtToken}`)
                .expect(common_1.HttpStatus.OK);
            expect(Array.isArray(resp.body)).toBeTruthy();
            expect(resp.body.length).toBeGreaterThanOrEqual(1);
            const item = resp.body[0];
            expect(item._id).toBeDefined();
            expect(item._id).not.toBeNull();
            expect(item.password).not.toBeDefined();
            expect(item.username).toBeDefined();
            expect(item.name).toBeDefined();
            expect(item.createdAt).toBeDefined();
            expect(item.updatedAt).toBeDefined();
            expect(resp.body).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    name: userValid.name,
                    username: userValid.username.trim().toLocaleLowerCase(),
                }),
            ]));
        });
    });
    describe('Update an user', () => {
        let _id;
        let userUpdate;
        let updatedAt;
        it('Found an user', async () => {
            const resp = await request(api)
                .get(`/user/${userValid.username}`)
                .set('Authorization', `Bearer ${jwtToken}`)
                .expect(common_1.HttpStatus.OK);
            expect(resp.body.username).toEqual(userValid.username.trim().toLocaleLowerCase());
            expect(resp.body._id).toBeDefined();
            expect(resp.body._id).not.toBeNull();
            _id = resp.body._id;
            userUpdate = new update_user_dto_1.UpdateUserDto(resp.body);
            userUpdate.name = faker_1.faker.name.fullName();
            userUpdate.isActive = false;
            updatedAt = resp.body.updatedAt;
        });
        it('Update an user - should handle not found', async () => {
            const _idFaker = faker_1.faker.datatype.uuid();
            const resp = await request(api)
                .patch(`/user/${_idFaker}`)
                .set('Authorization', `Bearer ${jwtToken}`)
                .send(userUpdate)
                .expect(common_1.HttpStatus.NOT_FOUND);
            expect(resp.body.error).toBe(`Id not found: (${_idFaker})`);
        });
        it('To Validate action not of update an user', async () => {
            const resp = await request(api)
                .get(`/user/Id/${_id}`)
                .set('Authorization', `Bearer ${jwtToken}`)
                .expect(common_1.HttpStatus.OK);
            expect(resp.body.username).toEqual(userValid.username.trim().toLocaleLowerCase());
            expect(resp.body.name).not.toEqual(userUpdate.name);
            expect(resp.body.isActive).not.toEqual(userUpdate.isActive);
            expect(resp.body.updatedAt).toEqual(updatedAt);
        });
        it('Update an user', async () => {
            const resp = await request(api)
                .patch(`/user/${_id}`)
                .set('Authorization', `Bearer ${jwtToken}`)
                .send(userUpdate)
                .expect(common_1.HttpStatus.OK);
            expect(resp.body.result.ok).toEqual(1);
        });
        it('To Validate action of update an user', async () => {
            const resp = await request(api)
                .get(`/user/Id/${_id}`)
                .set('Authorization', `Bearer ${jwtToken}`)
                .expect(common_1.HttpStatus.OK);
            expect(resp.body.username).toEqual(userValid.username.trim().toLocaleLowerCase());
            expect(resp.body.name).toEqual(userUpdate.name);
            expect(resp.body.isActive).toEqual(userUpdate.isActive);
            expect(resp.body.updatedAt).not.toEqual(updatedAt);
        });
    });
    describe('Delete an user', () => {
        let _id;
        it('Found an user', async () => {
            const resp = await request(api)
                .get(`/user/${userValid.username}`)
                .set('Authorization', `Bearer ${jwtToken}`)
                .expect(common_1.HttpStatus.OK);
            expect(resp.body.username).toEqual(userValid.username.trim().toLocaleLowerCase());
            expect(resp.body._id).toBeDefined();
            expect(resp.body._id).not.toBeNull();
            _id = resp.body._id;
        });
        it('Delete an user', async () => {
            const resp = await request(api)
                .delete(`/user/${_id}`)
                .set('Authorization', `Bearer ${jwtToken}`)
                .expect(common_1.HttpStatus.OK);
            expect(resp.body.result.ok).toEqual(1);
        });
        it('To Validate action of delete an user', async () => {
            await request(api)
                .get(`/user/Id/${_id}`)
                .set('Authorization', `Bearer ${jwtToken}`)
                .expect(common_1.HttpStatus.NOT_FOUND)
                .expect(/Id not found/);
        });
        it('Delete an user - should handle not found', async () => {
            const _idFaker = faker_1.faker.datatype.uuid();
            const resp = await request(api)
                .delete(`/user/${_idFaker}`)
                .set('Authorization', `Bearer ${jwtToken}`)
                .expect(common_1.HttpStatus.BAD_REQUEST);
            expect(resp.body.error).toBe(`user not deleted`);
        });
    });
});
//# sourceMappingURL=user.e2e-spec.js.map