import { EntityManager } from "./entity-manager";
import { PoolClient, QueryResultRow } from "pg";

export class BaseRepository {
  constructor(
    protected em: EntityManager
  ) {
  }

  query<T extends QueryResultRow>(sql: string, params?: any[]) {
    return this.em.query<T>(sql, params);
  }

  transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    return this.em.transaction(callback);
  }
}
