import { PublicUser, UserData } from "@common/user";
import { Publishable } from "@common/public";


export class User implements UserData, Publishable<PublicUser> {
  id!: number;
  email!: string;
  username!: string;
  avatarUrl?: string;

  token?: string;
  googleId?: string;

  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: UserData) {
    this.id = data.id;
    this.email = data.email!;
    this.username = data.username;
    this.avatarUrl = data.avatarUrl;
    this.token = data.token;
    this.googleId = data.googleId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toPublic(): PublicUser {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      avatarUrl: this.avatarUrl
    } as PublicUser;
  }
}
