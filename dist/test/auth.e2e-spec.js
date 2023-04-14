"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const request = require("supertest");
const app_module_1 = require("./../src/app.module");
const filter_1 = require("@baseApi/shared/filter");
const caCript = require("camaral-cript");
describe('Auth (e2e)', () => {
    let app;
    let api;
    let jwtToken;
    let rtToken;
    let newJwtToken;
    let newRtToken;
    let id;
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
        await Promise.all([app.close()]);
    });
    it('/ (GET)', () => {
        return request(app.getHttpServer())
            .get('/')
            .expect(common_1.HttpStatus.OK)
            .expect('Hello World!');
    });
    describe('Authentication', () => {
        describe('AuthModule', () => {
            it('authenticates user with valid credentials and provides a jwt token', async () => {
                const res = await request(api)
                    .post('/auth/login')
                    .send({ username, password })
                    .expect(common_1.HttpStatus.CREATED);
                expect(res.body.username).toEqual(username);
                expect(res.body.password).toBeUndefined();
                expect(res.body.id).toBeDefined();
                expect(res.body.username).toBeDefined();
                expect(res.body.token.access_token).toBeDefined();
                expect(res.body.token.refresh_token).toBeDefined();
                id = res.body.id;
                jwtToken = res.body.token.access_token;
                rtToken = res.body.token.refresh_token;
                expect(jwtToken).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/);
                expect(rtToken).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/);
            });
            it('fails to authenticate user with an incorrect password', async () => {
                const response = await request(api)
                    .post('/auth/login')
                    .send({ username, password: 'wrong' })
                    .expect(common_1.HttpStatus.UNAUTHORIZED);
                expect(response.body.token).toBeUndefined();
            });
            it('fails to authenticate user that does not exist', async () => {
                const response = await request(api)
                    .post('/auth/login')
                    .send({ username: 'nobody@example.com', password })
                    .expect(common_1.HttpStatus.UNAUTHORIZED);
                expect(response.body.token).not.toBeDefined();
            });
        });
        describe('Get Users', () => {
            it('should return forbidden on missing token', () => {
                return request(api).get('/user').expect(common_1.HttpStatus.UNAUTHORIZED);
            });
            it('gets protected resource with jwt authenticated request', async () => {
                const resp = await request(api)
                    .get(`/user/${username}`)
                    .set('Authorization', `Bearer ${jwtToken}`)
                    .expect(common_1.HttpStatus.OK);
                expect(resp.body._id).toBeDefined();
                expect(resp.body._id).not.toBeNull();
                expect(resp.body.password).not.toBeDefined();
                expect(resp.body.username).toEqual(username.trim().toLocaleLowerCase());
                expect(resp.body.name).toBeDefined();
                expect(resp.body.createdAt).toBeDefined();
                expect(resp.body.updatedAt).toBeDefined();
                const resValidToken = rtToken ===
                    caCript.caCript(resp.body.hashedRt, process.env.SECREDT_KEY_REFRESH)
                        .hash;
                expect(resValidToken).toBeTruthy();
            });
        });
    });
    describe('AuthMode - Refresh Token', () => {
        it('Authenticates with valid refresh token', async () => {
            const resNew = await request(api)
                .post('/auth/refresh')
                .set('Authorization', `Bearer ${rtToken}`)
                .expect(common_1.HttpStatus.OK);
            expect(resNew.body.username).toEqual(username);
            expect(resNew.body.password).toBeUndefined();
            expect(resNew.body.token.access_token).toBeDefined();
            expect(resNew.body.token.refresh_token).toBeDefined();
            newJwtToken = resNew.body.token.access_token;
            newRtToken = resNew.body.token.refresh_token;
            expect(newJwtToken).not.toEqual(jwtToken);
            expect(newRtToken).not.toEqual(rtToken);
            expect(newJwtToken).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/);
            expect(newRtToken).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/);
        });
        it('fails to authenticate refresh token with old token', async () => {
            const response = await request(api)
                .post('/auth/refresh')
                .set('Authorization', `Bearer ${rtToken}`)
                .expect(common_1.HttpStatus.FORBIDDEN);
            expect(response.body.token).not.toBeDefined();
        });
        it('fails to authenticate refresh token with fail token', async () => {
            const response = await request(api)
                .post('/auth/refresh')
                .set('Authorization', `Bearer ${rtToken}x`)
                .expect(common_1.HttpStatus.UNAUTHORIZED);
            expect(response.body.token).not.toBeDefined();
        });
        it('gets protected resource with jwt authenticated new after refresh token', async () => {
            const resp = await request(api)
                .get(`/user/${username}`)
                .set('Authorization', `Bearer ${newJwtToken}`)
                .expect(common_1.HttpStatus.OK);
            expect(resp.body._id).toBeDefined();
            expect(resp.body._id).not.toBeNull();
            expect(resp.body.password).not.toBeDefined();
            expect(resp.body.username).toEqual(username.trim().toLocaleLowerCase());
            expect(resp.body.name).toBeDefined();
            expect(resp.body.createdAt).toBeDefined();
            expect(resp.body.updatedAt).toBeDefined();
            const resValidToken = newRtToken ===
                caCript.caCript(resp.body.hashedRt, process.env.SECREDT_KEY_REFRESH)
                    .hash;
            expect(resValidToken).toBeTruthy();
        });
    });
    describe('Auth  - Logout', () => {
        it('Logout refresh token - Different UserName', async () => {
            await request(api)
                .post('/auth/logout')
                .send({ id: 'xxxxxxxx' })
                .expect(common_1.HttpStatus.OK);
        });
        it('gets protected resource with jwt authenticated new after refresh token - but logout a different username', async () => {
            const resp = await request(api)
                .get(`/user/${username}`)
                .set('Authorization', `Bearer ${newJwtToken}`)
                .expect(common_1.HttpStatus.OK);
            expect(resp.body._id).toBeDefined();
            expect(resp.body._id).not.toBeNull();
            expect(resp.body.password).not.toBeDefined();
            expect(resp.body.username).toEqual(username.trim().toLocaleLowerCase());
            expect(resp.body.name).toBeDefined();
            expect(resp.body.createdAt).toBeDefined();
            expect(resp.body.updatedAt).toBeDefined();
            const resValidToken = newRtToken ===
                caCript.caCript(resp.body.hashedRt, process.env.SECREDT_KEY_REFRESH)
                    .hash;
            expect(resValidToken).toBeTruthy();
        });
        it('Logout refresh token valid UserName', async () => {
            await request(api)
                .post('/auth/logout')
                .send({ id: id })
                .expect(common_1.HttpStatus.OK);
        });
        it('gets protected resource with jwt authenticated new after refresh token - need clear RtToken', async () => {
            const respLogout = await request(api)
                .get(`/user/${username}`)
                .set('Authorization', `Bearer ${newJwtToken}`)
                .expect(common_1.HttpStatus.OK);
            expect(respLogout.body._id).toBeDefined();
            expect(respLogout.body._id).not.toBeNull();
            expect(respLogout.body.password).not.toBeDefined();
            expect(respLogout.body.username).toEqual(username.trim().toLocaleLowerCase());
            expect(respLogout.body.name).toBeDefined();
            expect(respLogout.body.createdAt).toBeDefined();
            expect(respLogout.body.updatedAt).toBeDefined();
            expect(respLogout.body.hashedRt).toEqual(null);
        });
    });
});
//# sourceMappingURL=auth.e2e-spec.js.map