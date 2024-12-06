import { UserData } from "@common/user";
import { EntityManager } from "./entity-manager";
import { BaseFilters, QueryBuilder } from "../../util/query-builder";
import { PoolClient } from "pg";

export interface UserFilters extends BaseFilters {
  id?: number;
  email?: string;
  username?: string;
}

/**
 * Entity fields :
 * id
 * name
 * password
 * email
 * ip
 * token
 * avatarUrl
 * createdAt / updatedAt
 */
export class UserRepository {
  constructor(
    private em: EntityManager
  ) {
  }

  createQuery(filters?: UserFilters) {
    const qb = new QueryBuilder(filters).from('users u').select('u.*, u.avatar as "avatarUrl"');

    if (filters?.id) {
      qb.and('u.id = ' + qb.getCurrentParamIndex()).addParam(filters.id);
    }

    if (filters?.email) {
      qb.and('u.email = ' + qb.getCurrentParamIndex()).addParam(filters.email);
    }

    if (filters?.username) {
      qb.and('u.username = ' + qb.getCurrentParamIndex()).addParam(filters.username);
    }

    return qb;
  }

  async findAll(filters?: UserFilters, client?: PoolClient) {
    const qb = this.createQuery(filters);

    if (client) {
      return (await client.query<UserData>(qb.getQuery(), qb.getParams())).rows;
    } else {
      return (await this.em.query<UserData>(qb.getQuery(), qb.getParams())).rows;
    }
  }

  async findOne(filters?: UserFilters, client?: PoolClient) {
    return (await this.findAll(filters, client))[0];
  }

  findOneByEmail(email: string): Promise<UserData> {
    return this.findOne({email});
  }

  findOneByUsername(username: string) {
    return this.findOne({username: username});
  }

  // mapRow(row: {[key: string]: any}, withPassword = false): User {
  //   const u = {
  //     id: row.id,
  //     name: row.name,
  //     email: row.email
  //   } as User;
  //
  //   if (withPassword) {
  //     u.password = row.password;
  //   }
  //
  //   return u;
  // }

  async create(user: UserData) {
    return this.em.transaction(async (client) => {
      const sql = `INSERT INTO users (email, username, avatar, "googleId")
                   VALUES ($1, $2, $3, $4)
                   RETURNING id`;

      const params = [user.email, user.username, user.avatarUrl, user.googleId];

      const res = await client.query(sql, params);

      if (res?.rows.length) {
        return this.findOne(res.rows[0].id, client);
      }

      return null;
    });
  }

  update(user: UserData) {
    user.updatedAt = new Date();

    return this.em.transaction(async (client) => {
      const sql = `UPDATE users
                   SET username    = $1,
                       email       = $2,
                       "googleId"  = $3,
                       avatar      = $4,
                       "updatedAt" = $5
                   WHERE id = $6`;

      const params = [
        user.username, user.email, user.googleId, user.avatarUrl, user.updatedAt, user.id
      ];

      return client.query(sql, params);
    });
  }
}
