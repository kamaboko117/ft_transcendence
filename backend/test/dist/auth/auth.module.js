"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const users_module_1 = require("../users/users.module");
const passport_1 = require("@nestjs/passport");
const local_strategy_1 = require("./local.strategy");
const fake_strategy_1 = require("./fake.strategy");
const jwt_strategy_1 = require("./jwt.strategy");
const jwt_1 = require("@nestjs/jwt");
const core_1 = require("@nestjs/core");
const jwt_guard_1 = require("./jwt.guard");
let AuthModule = class AuthModule {
};
AuthModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => users_module_1.UsersModule), passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: process.env.AUTH_SECRET,
                signOptions: { expiresIn: '3000s' }
            })],
        providers: [{
                provide: core_1.APP_GUARD, scope: common_1.Scope.REQUEST, useClass: jwt_guard_1.JwtGuard
            }, auth_service_1.AuthService, local_strategy_1.LocalStrategy, fake_strategy_1.FakeStrategy, jwt_strategy_1.JwtStrategy],
        exports: [auth_service_1.AuthService]
    })
], AuthModule);
exports.AuthModule = AuthModule;
//# sourceMappingURL=auth.module.js.map