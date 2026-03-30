import { OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { CommentsService } from "./comments.service";
import { JwtService } from "@nestjs/jwt";
export declare class CommentsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private commentsService;
    private jwtService;
    server: Server;
    private logger;
    private typingUsers;
    constructor(commentsService: CommentsService, jwtService: JwtService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleNewComment(data: {
        text: string;
    }, client: Socket): Promise<void>;
    handleTyping(data: {
        isTyping: boolean;
    }, client: Socket): void;
}
