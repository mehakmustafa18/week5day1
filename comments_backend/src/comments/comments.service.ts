import { Injectable } from "@nestjs/common";

export interface Comment {
  id: number;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  user: { id: number; username: string };
}

@Injectable()
export class CommentsService {
  private comments: Comment[] = [];
  private nextId = 1;

  async findAll(): Promise<Comment[]> {
    return [...this.comments].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async create(comment: {
    text: string;
    user: { id: number; username: string };
  }): Promise<Comment> {
    const newComment: Comment = {
      id: this.nextId++,
      text: comment.text,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: comment.user,
    };
    this.comments.push(newComment);
    return newComment;
  }
}
