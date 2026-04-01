"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:3004"],
        credentials: true,
    });
    const server = await app.listen(process.env.PORT || 0);
    console.log(`Server running on port: ${server.address().port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map