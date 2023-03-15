"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const create_user_dto_1 = require("@baseApi/user/dto/create-user.dto");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const faker_1 = require("@faker-js/faker");
describe('Test of create user dto', () => {
    it('should throw when the password is empty', async () => {
        const dtoUser = {
            username: faker_1.faker.internet.userName(),
            name: faker_1.faker.name.fullName(),
            password: '',
        };
        const ofImportDto = (0, class_transformer_1.plainToInstance)(create_user_dto_1.CreateUserDto, dtoUser);
        const errors = await (0, class_validator_1.validate)(ofImportDto);
        expect(errors.length).not.toBe(0);
        expect(JSON.stringify(errors)).toContain('password should not be empty');
    });
    it('should throw when the password not is string', async () => {
        const user = {
            username: faker_1.faker.internet.userName(),
            name: faker_1.faker.name.fullName(),
            password: 3445,
        };
        const dtoUser = user;
        const ofImportDto = (0, class_transformer_1.plainToInstance)(create_user_dto_1.CreateUserDto, dtoUser);
        const errors = await (0, class_validator_1.validate)(ofImportDto);
        expect(errors.length).not.toBe(0);
        expect(JSON.stringify(errors)).toContain('Password not is string');
    });
    it('should throw when the password is too weak (1)', async () => {
        const dtoUser = {
            username: faker_1.faker.internet.userName(),
            name: faker_1.faker.name.fullName(),
            password: 'music',
        };
        const ofImportDto = (0, class_transformer_1.plainToInstance)(create_user_dto_1.CreateUserDto, dtoUser);
        const errors = await (0, class_validator_1.validate)(ofImportDto);
        expect(errors.length).not.toBe(0);
        expect(JSON.stringify(errors)).toContain('Password is too weak');
    });
    it('should throw when the password is too weak (2)', async () => {
        const dtoUser = {
            username: faker_1.faker.internet.userName(),
            name: faker_1.faker.name.fullName(),
            password: 'music123',
        };
        const ofImportDto = (0, class_transformer_1.plainToInstance)(create_user_dto_1.CreateUserDto, dtoUser);
        const errors = await (0, class_validator_1.validate)(ofImportDto);
        expect(errors.length).not.toBe(0);
        expect(JSON.stringify(errors)).toContain('Password is too weak');
    });
    it('should throw when the password is OK', async () => {
        const dtoUser = {
            username: faker_1.faker.internet.userName(),
            name: faker_1.faker.name.fullName(),
            password: 'music!123',
        };
        const ofImportDto = (0, class_transformer_1.plainToInstance)(create_user_dto_1.CreateUserDto, dtoUser);
        const errors = await (0, class_validator_1.validate)(ofImportDto);
        expect(errors.length).toBe(0);
    });
});
//# sourceMappingURL=password.validator.spec.js.map