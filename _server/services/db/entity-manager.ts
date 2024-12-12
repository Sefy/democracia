import { Pool, PoolClient, QueryResultRow } from 'pg';
import { UserRepository } from "./user-repository";
import { RoomRepository } from "./room-repository";
import { Container } from "../container";
import { TagRepository } from "./tag-repository";
import { MessageRepository } from "./message-repository";
import { env } from "../../env";
import { VoteRepository } from "./vote-repository";

// ca reste bien chiant ... @TODO: retry ORM, pour de bon, une fois clarifié la distinction entre chat et DB lol

export class EntityManager {

  pool = new Pool({
    connectionString: env.DB_URL
  });

  repositories = {
    user: new UserRepository(this),
    room: new RoomRepository(this),
    message: new MessageRepository(this),
    tag: new TagRepository(this),
    vote: new VoteRepository(this)
  };

  constructor(
    private container: Container
  ) {
  }

  async query<T extends QueryResultRow>(text: string, params?: any[]) {
    return this.pool.query<T>(text, params);
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  get user() {
    return this.repositories.user;
  }

  get room() {
    return this.repositories.room;
  }

  get message() {
    return this.repositories.message;
  }

  get tag() {
    return this.repositories.tag;
  }

  get vote() {
    return this.repositories.vote;
  }
}
