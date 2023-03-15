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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const user_service_1 = require("../user/user.service");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const argon = require("argon2");
let AuthService = class AuthService {
    constructor(userService, jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }
    async validateUser(login) {
        const user = await this.userService.findOne(login.username);
        if (!user) {
            throw new common_1.UnauthorizedException({
                message: 'User not found',
            });
        }
        const passwordValid = await bcrypt.compare(login.password + login.username, user.password);
        if (!passwordValid) {
            throw new common_1.UnauthorizedException({
                message: 'Invalid credentials',
            });
        }
        return user;
    }
    async login(userLogin) {
        const user = await this.userService.findOne(userLogin.username);
        if (!user) {
            throw new common_1.ForbiddenException('Access Denied');
        }
        else {
            if (!user.isActive) {
                throw new common_1.ForbiddenException('Access Denied - User not is active');
            }
            else {
                const token = this.createToken(user.username);
                await this.userService.updateRtHash(user.username, token.refresh_token);
                return {
                    id: user._id,
                    username: user.username,
                    token: token,
                };
            }
        }
    }
    async logout(userId) {
        await this.userService.updateRtLogout(userId);
        return true;
    }
    async refreshTokens(userName, rt) {
        const user = await this.userService.findOne(userName);
        if (!user || !user.hashedRt) {
            throw new common_1.ForbiddenException('Access Denied');
        }
        else {
            if (!user.isActive) {
                throw new common_1.ForbiddenException('Access Denied - User not is active');
            }
            else {
                const rtMatches = await argon.verify(user.hashedRt, rt);
                if (!rtMatches) {
                    throw new common_1.ForbiddenException('Access Denied - No Matches');
                }
                else {
                    const token = await this.createToken(user.username);
                    await this.userService.updateRtHash(user.username, token.refresh_token);
                    return {
                        id: user._id,
                        username: user.username,
                        token: token,
                    };
                }
            }
        }
    }
    async validateToken(jwt) {
        try {
            return await this.jwtService.verify(jwt);
        }
        catch (e) {
            common_1.Logger.log('validateToken:' + e);
            return false;
        }
    }
    createToken(userName) {
        const identific = uuid.v4();
        const payload = { username: userName, identific };
        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.SECREDT_KEY_AUTH,
            expiresIn: process.env.EXPIRESIN,
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.SECREDT_KEY_REFRESH,
            expiresIn: process.env.EXPIRESIN_REFRESH,
        });
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map