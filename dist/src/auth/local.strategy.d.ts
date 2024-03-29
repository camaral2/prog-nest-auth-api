import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
import { RequestUserDto } from './dto/request-user.dto';
declare const LocalStrategy_base: new (...args: any[]) => Strategy;
export declare class LocalStrategy extends LocalStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(username: string, password: string): Promise<RequestUserDto>;
}
export {};
