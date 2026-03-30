import { CommentsService, Comment } from "./comments.service";
export declare class CommentsController {
    private commentsService;
    constructor(commentsService: CommentsService);
    getAllComments(): Promise<Comment[]>;
    createComment(body: {
        text: string;
    }, req: any): Promise<Comment>;
}
