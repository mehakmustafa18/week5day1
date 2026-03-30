import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { JwtService } from "@nestjs/jwt";

@WebSocketGateway({
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    credentials: true,
  },
})
export class CommentsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger("CommentsGateway");
  private typingUsers: Map<string, { userId: number; username: string }> =
    new Map();

  constructor(
    private commentsService: CommentsService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    if (!token) {
      this.logger.warn(`Client ${client.id} disconnected: no token`);
      client.disconnect();
      return;
    }
    try {
      const payload = this.jwtService.verify(token);
      client.data.user = { userId: payload.sub, username: payload.username };
      this.logger.log(
        `Client ${client.id} authenticated as ${payload.username}`,
      );
      const comments = await this.commentsService.findAll();
      client.emit("initial_comments", comments);
    } catch (err) {
      this.logger.warn(`Client ${client.id} disconnected: invalid token`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.user) {
      this.typingUsers.delete(client.id);
      this.server.emit("user_stopped_typing", {
        userId: client.data.user.userId,
      });
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("new_comment")
  async handleNewComment(
    @MessageBody() data: { text: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.data.user) return;
    const newComment = await this.commentsService.create({
      text: data.text,
      user: {
        id: client.data.user.userId,
        username: client.data.user.username,
      },
    });
    this.server.emit("new_comment", newComment);
  }

  @SubscribeMessage("typing")
  handleTyping(
    @MessageBody() data: { isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.data.user) return;
    if (data.isTyping) {
      this.typingUsers.set(client.id, {
        userId: client.data.user.userId,
        username: client.data.user.username,
      });
      client.broadcast.emit("user_typing", {
        userId: client.data.user.userId,
        username: client.data.user.username,
      });
    } else {
      this.typingUsers.delete(client.id);
      client.broadcast.emit("user_stopped_typing", {
        userId: client.data.user.userId,
      });
    }
  }
}
