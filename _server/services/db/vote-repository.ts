import { BaseRepository } from "./base-repository";
import { BaseFilters, QueryBuilder, QueryColumnDef } from "../../util/query-builder";
import { VoteData } from "@common/vote";
import { EntityManager } from "./entity-manager";
import { VoteFilters } from "../vote.service";

class VoteQueryBuilder extends QueryBuilder {
  constructor(filters?: VoteFilters) {
    super(filters);
  }

  columns: QueryColumnDef[] = [
    {name: 'id'},
    {name: 'title'},
    {name: 'description'},
    {name: 'created_by', alias: 'createdBy'},
    {name: 'created_at', alias: 'createdAt'},
    {name: 'updated_at', alias: 'updatedAt'},
    {name: 'expires_at', alias: 'expiresAt'},
  ];

  getAllColumns(alias = false) {
    return this.columns.map(c => alias && c.alias ? `${c.name} AS "${c.alias}"` : c.name);
  }

  selectAll(table = 'v') {
    const select = this.getAllColumns(true).map(c => `${table}.${c}`).join(', ');

    return this.addSelect(select);
  }
}

export class VoteRepository extends BaseRepository {
  constructor(protected em: EntityManager) {
    super(em);
  }

  createQuery(filters?: VoteFilters) {
    const qb = new VoteQueryBuilder(filters).from('votes v').selectAll();

    // par défaut on va ramener les options à chaque fois, sinon useless .. ?
    qb.leftJoin('vote_options vo ON vo.vote_id = v.id');

    if (filters?.loadCounts) {
      qb.leftJoin(`
          (
          SELECT vote_option_id, COUNT(*) as count
          FROM vote_choices
          GROUP BY vote_option_id
        ) vc ON vo.id = vc.vote_option_id
      `);
    }

    qb.addSelect(`json_agg(
        json_build_object(
          'id', vo.id,
          'title', vo.text
          ${filters?.loadCounts ? `, 'count', COALESCE(vc.count, 0)` : ''}
        ) ORDER BY vo.id
      ) as options
    `);

    qb.addGroupBy('v.id');

    return qb;
  }

  async findAll(filters?: VoteFilters) {
    const qb = this.createQuery(filters);

    return (await this.em.query<VoteData>(qb.getQuery(), qb.getParams())).rows;
  }
}
