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

    // @TODO: devrait potentiellement chercher dans les options rattachées aussi .. ?
    // mais pas vraiment faisable ici => voir pour pré requête qui remonterait les vote_id des options filtrées ..
    if (filters?.search) {
      const paramIndex = qb.getCurrentParamIndex();

      qb.and('(lower(v.title) LIKE ' + paramIndex + ' OR lower(v.description) LIKE ' + paramIndex + ')')
        .addParam('%' + filters.search.toLowerCase() + '%');
    }

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
          'text', vo.text
          ${filters?.loadCounts ? `, 'count', COALESCE(vc.count, 0)` : ''}
        ) ORDER BY vo.id
      ) as options
    `);

    qb.addGroupBy('v.id');

    return qb;
  }

  async findAll(filters?: VoteFilters) {
    const qb = this.createQuery(filters);

    return (await this.query<VoteData>(qb.getQuery(), qb.getParams())).rows;
  }

  async find(filters?: VoteFilters) {
    filters = {...filters, count: 1};

    return (await this.findAll(filters))[0];
  }

  create(data: Partial<VoteData>) {
    return this.transaction(async (client) => {
      const createdById = typeof data.createdBy === 'object' ? data.createdBy.id : data.createdBy;

      // Create vote
      const voteResult = await client.query(
        `INSERT INTO votes (title, description, created_by)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [data.title, data.description, createdById]
      );

      const vote = voteResult.rows[0];

      // Create options
      const optionValues = (data.options ?? [])
        .map((opt) => `('${vote.id}', '${opt.text}')`)
        .join(',');

      await client.query(`
        INSERT INTO vote_options (vote_id, text)
        VALUES ${optionValues}
      `);

      return this.find(vote.id);
    });
  }

  async vote(voteId: string, optionId: string, userId: string): Promise<void> {
    return this.transaction(async (client) => {
      // Remove existing vote if any
      await client.query(
        `DELETE FROM vote_choices
         WHERE user_id = $1 AND vote_option_id IN (
           SELECT id FROM vote_options WHERE vote_id = $2
         )`,
        [userId, voteId]
      );

      // Add new vote
      await client.query(
        `INSERT INTO vote_choices (vote_option_id, user_id)
         VALUES ($1, $2)`,
        [optionId, userId]
      );
    });
  }
}
