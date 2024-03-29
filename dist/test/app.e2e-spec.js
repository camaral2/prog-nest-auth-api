"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const app_module_1 = require("./../src/app.module");
describe('AppController (e2e)', () => {
    let app;
    beforeEach(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
    });
    afterAll(async () => {
        await Promise.all([app.close()]);
    });
    it('/ (GET)', () => {
        return request(app.getHttpServer()).get('/').expect(200).expect({
            app: 'prog-nest-auth',
            author: 'Cristian dos Santos Amaral',
            email: 'cristian_amaral@hotmail.com',
            version: process.env.npm_package_version,
        });
    });
});
//# sourceMappingURL=app.e2e-spec.js.map