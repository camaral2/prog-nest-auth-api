"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
describe('AppController', () => {
    let appController;
    beforeEach(async () => {
        const app = await testing_1.Test.createTestingModule({
            controllers: [app_controller_1.AppController],
            providers: [app_service_1.AppService],
        }).compile();
        appController = app.get(app_controller_1.AppController);
    });
    describe('root', () => {
        it('should return "Detail of service"', () => {
            expect(appController.getVersion()).toMatchObject({
                app: 'prog-nest-auth',
                author: 'Cristian dos Santos Amaral',
                email: 'cristian_amaral@hotmail.com',
                version: process.env.npm_package_version,
            });
        });
    });
});
//# sourceMappingURL=app.controller.spec.js.map