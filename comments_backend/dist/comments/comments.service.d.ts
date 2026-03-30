export interface Comment {
    id: number;
    text: string;
    createdAt: Date;
    updatedAt: Date;
    user: {
        id: number;
        username: string;
    };
}
export declare class CommentsService {
    private comments;
    private nextId;
    findAll(): Promise<Comment[]>;
    create(comment: {
        text: string;
        user: {
            id: number;
            username: string;
        };
    }): Promise<Comment>;
}
