"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
require("dotenv/config");
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const filter_1 = require("./shared/filter");
const microservices_1 = require("@nestjs/microservices");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_2.ValidationPipe());
    app.use((0, helmet_1.default)());
    app.useGlobalFilters(new filter_1.HttpExceptionFilter());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Project prog-nest-auth')
        .setDescription('The Realworld API description')
        .setVersion('1.0')
        .setBasePath('doc')
        .addTag('user')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    const PORT = process.env.PORT || 4000;
    const PORT_MCRO = process.env.PORT_MCRO || 4010;
    const HOST_MCRO = process.env.HOST_MCRO || 'localhost';
    app.connectMicroservice({
        transport: microservices_1.Transport.TCP,
        options: {
            host: HOST_MCRO,
            port: PORT_MCRO,
        },
    }, { inheritAppConfig: true });
    await app.startAllMicroservices();
    await app.listen(PORT, () => {
        common_1.Logger.log(`Listening on PORT: ${PORT}`);
    });
}
bootstrap();
//# sourceMappingURL=main.js.map