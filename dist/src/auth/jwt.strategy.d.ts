import { AuthService } from './auth.service';
import { Strategy } from 'passport-jwt';
import 'dotenv/config';
import { UserService } from '../user/user.service';
import { RequestUserDto } from './dto/request-user.dto';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly authService;
    private readonly userService;
    constructor(authService: AuthService, userService: UserService);
    validate(payload: any): Promise<RequestUserDto>;
}
export {};
