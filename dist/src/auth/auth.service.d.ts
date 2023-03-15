import { UserService } from '../user/user.service';
import { LoginUserDto } from '../auth/dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { tokensLogin } from './types/tokensLogin-types';
export declare class AuthService {
    private readonly userService;
    private jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    validateUser(login: LoginUserDto): Promise<User>;
    login(userLogin: LoginUserDto): Promise<tokensLogin>;
    logout(userId: string): Promise<boolean>;
    refreshTokens(userName: string, rt: string): Promise<tokensLogin>;
    validateToken(jwt: string): Promise<any>;
    private createToken;
}
