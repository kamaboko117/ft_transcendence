import { ExecutionContext } from '@nestjs/common';
import { AuthService } from './auth.service';
declare const JwtFirstGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JwtFirstGuard extends JwtFirstGuard_base {
    private authService;
    constructor(authService: AuthService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
export {};
