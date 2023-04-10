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
exports.FakeStrategy = void 0;
const passport_custom_1 = require("passport-custom");
const passport_1 = require("@nestjs/passport");
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
let FakeStrategy = class FakeStrategy extends (0, passport_1.PassportStrategy)(passport_custom_1.Strategy, "fake-custom") {
    constructor(authService) {
        super();
        this.authService = authService;
    }
    async validate(req) {
        const user = await this.authService.fakeUser();
        console.log("uuu");
        console.log(user);
        if (!user || typeof user == "undefined")
            throw new common_1.UnauthorizedException();
        return (user);
    }
};
FakeStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], FakeStrategy);
exports.FakeStrategy = FakeStrategy;
//# sourceMappingURL=fake.strategy.js.map