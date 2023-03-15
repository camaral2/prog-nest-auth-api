"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./entities/user.entity");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const argon = require("argon2");
const uuid = require("uuid");
let UserService = class UserService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async onModuleInit() {
        const users = await this.findAll();
        if (users.length == 0 || !users || users == undefined || users == null) {
            try {
                await this.create({
                    username: 'cristian.amaral',
                    name: 'Cristian dos Santos Amaral',
                    password: 'teste_12',
                });
            }
            catch (error) {
                console.log(error);
            }
        }
    }
    async create(createUserDto) {
        const user = new user_entity_1.User(createUserDto);
        user._id = uuid.v4();
        user.username = createUserDto.username.toLowerCase().trim();
        user.isActive = true;
        user.password = await this.hashPassword(createUserDto);
        const ret = await this.usersRepository.save(user);
        return ret;
    }
    async findAll() {
        const arr = await this.usersRepository.find();
        arr.forEach((object) => {
            delete object.password;
            delete object.hashedRt;
        });
        return arr;
    }
    async findOne(username) {
        if (!username || username.trim().length === 0 || username == undefined)
            throw new common_1.BadRequestException('username is empty');
        const user = await this.usersRepository.findOneBy({
            username: username.toLowerCase().trim(),
        });
        return user;
    }
    async findOneId(id) {
        if (!id || id == undefined)
            throw new common_1.BadRequestException('id is empty');
        const user = await this.usersRepository.findOne({ where: { _id: id } });
        if (!user)
            throw new common_1.NotFoundException(`Id not found: (${id})`);
        return user;
    }
    async update(id, updateUserDto) {
        const user = await this.findOneId(id);
        user.name = updateUserDto.name;
        user.isActive = updateUserDto.isActive;
        user.updatedAt = new Date();
        const ret = await this.usersRepository.update({ _id: id }, user);
        if (ret.affected > 0)
            return { result: { n: ret.affected, ok: ret.affected } };
        else
            throw new common_1.BadRequestException('user not updated');
    }
    async remove(id) {
        const ret = await this.usersRepository.delete({ _id: id });
        if (ret.affected > 0) {
            return { result: { n: ret.affected, ok: ret.affected } };
        }
        else
            throw new common_1.BadRequestException('user not deleted');
    }
    async updateRtHash(userName, rt) {
        const hashRt = await argon.hash(rt);
        await this.usersRepository.update({ username: userName }, { hashedRt: hashRt });
    }
    async updateRtLogout(userId) {
        await this.usersRepository.update({ _id: userId }, { hashedRt: null });
    }
    async hashPassword(user) {
        const saltOrRounds = 10;
        const hash = await bcrypt.hash(user.password + user.username, saltOrRounds);
        return hash;
    }
};
UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map