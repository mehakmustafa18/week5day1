import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: true,
  });
  const server = await app.listen(process.env.PORT || 0);
  console.log(`Server running on port: ${(server.address() as any).port}`);
}
bootstrap();
