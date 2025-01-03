import { EntityManager } from "./entity-manager";
import { LoadOptions } from "../room.service";
import { QueryBuilder } from "../../util/query-builder";
import { TagData } from "@common/room";
import { TagFilters } from "../tag.service";

export class TagRepository {
  constructor(
    private em: EntityManager
  ) {
  }

  buildQuery(filters?: TagFilters, loadOptions?: LoadOptions) {
    const qb = new QueryBuilder(filters).from('tags t').addSelect('t.*');

    if (filters?.id) {
      qb.and('t.id = ' + qb.getCurrentParamIndex()).addParam(filters.id);
    }

    if (filters?.ids) {
      qb.and('t.id = ANY(' + qb.getCurrentParamIndex() + '::int[])').addParam(filters.ids);
    }

    if (filters?.roomId) {
      qb.join('room_tags rt ON rt.id_tag = t.id AND rt.id_room = ' + qb.getCurrentParamIndex())
        .addParam(filters.roomId);
    }

    return qb;
  }

  async findAll(filters?: TagFilters) {
    const qb = this.buildQuery(filters);

    return (await this.em.query<TagData>(qb.getQuery(), qb.getParams())).rows;
  }

  getRoomTags(id: number) {
    const qb = this.buildQuery({roomId: id});

    return this.em.query<TagData>(qb.getQuery(), qb.getParams()).then(res => res.rows);
  }

  create(tag: Omit<TagData, 'id'>) {
    const sql = `
      INSERT INTO tags (name, color, icon) VALUES ($1, $2, $3)
    `;

    const params = [tag.name, tag.color, tag.icon];

    return this.em.transaction(client => client.query(sql, params));
  }
}
