import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:3004"],
    credentials: true,
  });
  const server = await app.listen(process.env.PORT || 0);
  console.log(`Server running on port: ${(server.address() as any).port}`);
}
bootstrap();
