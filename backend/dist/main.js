"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const cookieParser = require("cookie-parser");
const fs_1 = require("fs");
const express_1 = require("express");
let httpsOptions = null;
async function bootstrap() {
    const keyP = (0, fs_1.readFileSync)(String(process.env.HTTPS_KEY));
    const certP = (0, fs_1.readFileSync)(String(process.env.HTTPS_CERT));
    httpsOptions = {
        key: keyP,
        cert: certP,
    };
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { httpsOptions });
    app.useGlobalPipes(new common_1.ValidationPipe());
    app.enableCors();
    app.use(cookieParser());
    app.use((0, express_1.json)({ limit: '10mb' }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: '10mb' }));
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map