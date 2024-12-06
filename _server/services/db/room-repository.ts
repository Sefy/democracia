import { RoomData, TagData } from "@common/room";
import { EntityManager } from "./entity-manager";
import { LoadOptions } from "../room.service";
import { BaseFilters, QueryBuilder } from "../../util/query-builder";
import { PoolClient } from "pg";

// Actually these are "BaseFilters" ? :)
export interface RoomFilters extends BaseFilters {
  id?: number;
  search?: string;
}

export class RoomRepository {
  constructor(
    private em: EntityManager
  ) {
  }

  buildQuery(filters?: RoomFilters, loadOptions?: LoadOptions) {
    const qb = new QueryBuilder(filters).from('rooms r').addSelect('r.*');

    if (filters?.id) {
      qb.and('r.id = ' + qb.getCurrentParamIndex()).addParam(filters.id);
    }

    if (filters?.search) {
      const paramIndex = qb.getCurrentParamIndex();

      qb.and('(lower(r.title) LIKE ' + paramIndex + ' OR lower(r.description) LIKE ' + paramIndex + ')')
        .addParam('%' + filters.search.toLowerCase() + '%');
    }

    return qb;
  }

  async findAll(filters?: RoomFilters, loadOptions?: LoadOptions) {
    const qb = this.buildQuery(filters, loadOptions);

    // @TODO: parseRow => get Object, with loaded data (according to LoadOptions)
    return (await this.em.query<RoomData>(qb.getQuery(), qb.getParams())).rows;
  }

  async findOne(filters?: RoomFilters, loadOptions?: LoadOptions) {
    filters!.count = 1;

    return (await this.findAll(filters, loadOptions))[0];
  }

  create(roomData: RoomData) {
    return this.em.transaction(async (client) => {
      const sql = `INSERT INTO "rooms" (title, description, "createdBy")
                   VALUES ($1, $2, $3)
                   RETURNING id`;

      const params = [roomData.title, roomData.description, roomData.createdBy?.id];

      const created = await client.query(sql, params);

      roomData.id = created.rows[0].id;

      if (Array.isArray(roomData.tags) && roomData.tags.length) {
        await this.saveRoomTags(roomData, client);
      }
    });
  }

  // ça devient caca ... re réflechir à l'utilisation d'un ORM, plus tard ...
  // (on fait pas d'update en base à chaque message, donc pas besoin de se stresser sur les perfs ...)
  // dans un premier temps, stabilité > all
  saveRoomTags(room: RoomData, client?: PoolClient) {
    const tags = room.tags as TagData[];

    if (!tags?.length) {
      return;
    }

    const tagValues = tags.map(t => `(${room.id}, ${t.id})`).join(', ');

    const sql = `
          INSERT INTO room_tags (id_room, id_tag)
          VALUES ${tagValues}
    `;

    return client ? client.query(sql) : this.em.query(sql);
  }

  update(room: RoomData) {
    room.updatedAt = new Date();

    return this.em.transaction(async (client) => {
      const sql = `UPDATE "rooms"
                   SET title           = $1,
                       description     = $2,
                       "updatedAt"     = $3,
                       "messagesCount" = $4,
                       "trendingScore" = $5
                   WHERE id = $6`;

      const params = [
        room.title, room.description, room.updatedAt, room.messagesCount, room.trendingScore, room.id
      ];

      await client.query(sql, params);
    });
  }
}
