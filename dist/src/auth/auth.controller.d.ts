import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { tokensLogin } from './types/tokensLogin-types';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(login: LoginUserDto): Promise<tokensLogin>;
    loggedIn(data: any): Promise<any>;
    refreshTokens(request: any): Promise<tokensLogin>;
    logout(user: any): Promise<boolean>;
}
