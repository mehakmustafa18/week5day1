export interface User {
    id: number;
    username: string;
    password: string;
}
export declare class UsersService {
    private users;
    private nextId;
    findOneById(id: number): Promise<User | null>;
    findOneByUsername(username: string): Promise<User | null>;
    create(username: string, password: string): Promise<User>;
}
