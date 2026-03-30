import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CommentsService, Comment } from "./comments.service";

@Controller("comments")
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get()
  async getAllComments(): Promise<Comment[]> {
    return this.commentsService.findAll();
  }

  @Post()
  @UseGuards(AuthGuard("jwt"))
  async createComment(
    @Body() body: { text: string },
    @Request() req,
  ): Promise<Comment> {
    const comment = await this.commentsService.create({
      text: body.text,
      user: { id: req.user.userId, username: req.user.username },
    });
    return comment;
  }
}
