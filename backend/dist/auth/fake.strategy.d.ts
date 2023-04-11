import { Strategy } from 'passport-custom';
import { AuthService } from './auth.service';
declare const FakeStrategy_base: new (...args: any[]) => Strategy;
export declare class FakeStrategy extends FakeStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(req: any): Promise<any>;
}
export {};
