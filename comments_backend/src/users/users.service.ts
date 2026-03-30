// src/users/users.service.ts
import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";

export interface User {
  id: number;
  username: string;
  password: string; // this should be the hashed password
}

@Injectable()
export class UsersService {
  private users: User[] = [];
  private nextId = 1;

  async findOneById(id: number): Promise<User | null> {
    return this.users.find((user) => user.id === id) || null;
  }

  async findOneByUsername(username: string): Promise<User | null> {
    return this.users.find((user) => user.username === username) || null;
  }

  async create(username: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: this.nextId++,
      username,
      password: hashedPassword,
    };
    this.users.push(newUser);
    // Log to verify the stored hashed password
    console.log("New user created:", { username, hashedPassword });
    return newUser;
  }
}
