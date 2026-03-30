import { Module } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { CommentsGateway } from "./comments.gateway";
import { CommentsController } from "./comments.controller"; // optional
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule], // Now JwtService is available
  providers: [CommentsService, CommentsGateway],
  controllers: [CommentsController], // remove if not used
  exports: [CommentsService],
})
export class CommentsModule {}
