import { AnonData, PublicUser, UserData } from "@common/user";
import { Container } from "./container";
import { OAuth2Client } from "google-auth-library";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../env";
import { ChatService } from "./chat.service";
import { UserFilters } from "./db/user-repository";
import { LogService } from "./log.service";
import { User } from "../object/user";

// const SALT_ROUNDS = 7;

export type TokenData = Partial<UserData> | Partial<AnonData>;

export class UserService {

  client: OAuth2Client;

  constructor(
    private container: Container
  ) {
    this.client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
  }

  async getOneBy(filters?: UserFilters) {
    const user = await this.repository.findOne(filters);

    return user ? this.getPublicData(user) : null;
  }

  async getOneByEmail(email: string) {
    return this.getOneBy({email});
  }

  // async authenticate(email: string, password: string): Promise<User | null> {
  //   const user = await this.repository.findOneByEmail(email);
  //
  //   if (user && bcrypt.compareSync(password, user.password!)) {
  //     return user;
  //   }
  //
  //   return null;
  // }

  async verifyGoogleToken(token: string) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new Error('Token payload is empty');
      }

      return {
        googleId: payload['sub'],
        email: payload['email'],
        avatarUrl: payload['picture'],
        username: payload['given_name'] || payload['name']?.split(' ')[0]
      } as UserData;
    } catch (error: any) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  getPublicData(user: UserData) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl
    } as PublicUser;
  }

  generateToken(payload: object) {
    return jwt.sign(
      payload,
      env.SECRET, // Clé secrète
      {expiresIn: '3h'} // @TODO: move to env (app options)
    );
  }

  authentifyToken(token: string) {
    return new Promise<(TokenData & JwtPayload) | undefined>((resolve, reject) => {
      jwt.verify(token, env.SECRET, (err: any, data: any) => {
        // @TODO: eventuellement logger le error mais bon, sinon osef du détail ...
        if (err) {
          this.logService.error('Error in UserService::authentifyToken : ', err);
        }

        resolve(data);
      });
    });
  }

  createUser(data: UserData) {
    // if (data.password && !data.googleId) {
    //   throw new Error('Impossible de créer un User sans password et sans Google Auth .. ?');
    // }
    //
    // if (data.password) {
    //   user.password = bcrypt.hashSync(data.password, SALT_ROUNDS);
    // }

    return this.repository.create(data);
  }

  // @TODO: check qu'on a pas déjà quelqu'un (anonymous) sur cette IP
  // @TODO: voir plus tard, trop strict pour l'instant ...
  // registerAnon(ip?: string) {
  //   const existing = ip ? this.findByIp(ip) : null;
  //
  //   if (existing) {
  //     return existing;
  //   }
  //
  //   return this.createAnon(ip, true);
  // }

  getTokenFromRequest(authHeader: string | undefined) {
    return authHeader ? authHeader.split(' ')[1] : null;
  }

  async getUserFromRequestToken(authHeader: string | undefined) {
    const token = this.getTokenFromRequest(authHeader);

    if (token) {
      const authUserData = await this.authentifyToken(token);

      if (authUserData?.email) {
        return await this.getOneByEmail(authUserData.email);
      }
    }

    return null;
  }

  findByUsername(username: string, except?: number) {
    return this.repository.findOneByUsername(username);
  }

  getCleanUsername(username: string) {
    return username.replace(/[^[a-zA-Z0-9\-_)]*/g, '');
  }

  updateUser(user: UserData) {
    return this.repository.update(user);
  }

  newAnon(data: Partial<AnonData>) {
    return {
      id: crypto.randomUUID(),
      ip: data.ip
    } as AnonData;
  }

  get repository() {
    return this.container.em.user;
  }

  get chatService() {
    return this.container.get('chat.service') as ChatService;
  }

  get logService() {
    return this.container.get('log.service') as LogService;
  }
}
