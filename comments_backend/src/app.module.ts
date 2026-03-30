import { Module } from "@nestjs/common";
import { UsersModule } from "./users/users.module";
import { CommentsModule } from "./comments/comments.module";
import { AuthModule } from "./auth/auth.module";
import { CommentsGateway } from "./comments/comments.gateway";

@Module({
  imports: [UsersModule, CommentsModule, AuthModule],
})
export class AppModule {}
