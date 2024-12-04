export type UserRole = 'ADMIN' | 'MODERATOR' | 'USER';

export interface UserData {
  id: number;
  username: string;
  email?: string;

  avatarUrl?: string;

  // never publish (nor store in socket services) !
  token?: string;
  // password?: string;

  googleId?: string;

  createdAt?: Date;
  updatedAt?: Date;

  anon?: boolean;
  role?: UserRole;
}

export interface PublicUser {
  id: number;
  username: string;
  email?: string;
  avatarUrl?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AnonData {
  id: string;
  ip: string;
}
