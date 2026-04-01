"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const comments_service_1 = require("./comments.service");
const jwt_1 = require("@nestjs/jwt");
let CommentsGateway = class CommentsGateway {
    constructor(commentsService, jwtService) {
        this.commentsService = commentsService;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger("CommentsGateway");
        this.typingUsers = new Map();
    }
    async handleConnection(client) {
        const token = client.handshake.auth.token;
        if (!token) {
            this.logger.warn(`Client ${client.id} disconnected: no token`);
            client.disconnect();
            return;
        }
        try {
            const payload = this.jwtService.verify(token);
            client.data.user = { userId: payload.sub, username: payload.username };
            this.logger.log(`Client ${client.id} authenticated as ${payload.username}`);
            const comments = await this.commentsService.findAll();
            client.emit("initial_comments", comments);
        }
        catch (err) {
            this.logger.warn(`Client ${client.id} disconnected: invalid token`);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        if (client.data.user) {
            this.typingUsers.delete(client.id);
            this.server.emit("user_stopped_typing", {
                userId: client.data.user.userId,
            });
        }
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    async handleNewComment(data, client) {
        if (!client.data.user)
            return;
        const newComment = await this.commentsService.create({
            text: data.text,
            user: {
                id: client.data.user.userId,
                username: client.data.user.username,
            },
        });
        this.server.emit("new_comment", newComment);
    }
    handleTyping(data, client) {
        if (!client.data.user)
            return;
        if (data.isTyping) {
            this.typingUsers.set(client.id, {
                userId: client.data.user.userId,
                username: client.data.user.username,
            });
            client.broadcast.emit("user_typing", {
                userId: client.data.user.userId,
                username: client.data.user.username,
            });
        }
        else {
            this.typingUsers.delete(client.id);
            client.broadcast.emit("user_stopped_typing", {
                userId: client.data.user.userId,
            });
        }
    }
};
exports.CommentsGateway = CommentsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], CommentsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)("new_comment"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], CommentsGateway.prototype, "handleNewComment", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("typing"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], CommentsGateway.prototype, "handleTyping", null);
exports.CommentsGateway = CommentsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:3004"],
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [comments_service_1.CommentsService,
        jwt_1.JwtService])
], CommentsGateway);
//# sourceMappingURL=comments.gateway.js.map