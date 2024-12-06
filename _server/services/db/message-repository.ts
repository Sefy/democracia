import { EntityManager } from "./entity-manager";
import { QueryBuilder, QueryColumnDef } from "../../util/query-builder";
import { LoadOptions, MessageFilters } from "../message-service";
import { MessageData, VoteData, VoteType } from "@common/message";
import { Message, Vote } from "../../object/message";
import { PoolClient } from "pg";

class MessageQueryBuilder extends QueryBuilder {
  constructor(filters?: MessageFilters) {
    super(filters);
  }

  columns: QueryColumnDef[] = [
    {name: 'id'},
    {name: 'content'},
    {name: 'created_at', alias: 'date'},
    {name: 'user_id', alias: 'author'},
    {name: 'room_id'},
  ];

  getAllColumns(alias = false) {
    return this.columns.map(c => alias && c.alias ? `${c.name} AS ${c.alias}` : c.name);
  }

  selectAll() {
    const select = this.getAllColumns(true).map(c => 'm.' + c).join(', ');

    return this.addSelect(select);
  }

  addVotesJoins() {
    return this
      .leftJoin(`(
              SELECT message_id, COUNT(*) as count
              FROM message_votes
              WHERE vote_type = 'UP'
              GROUP BY message_id
              ) up_votes ON m.id = up_votes.message_id`
      ).leftJoin(`(
              SELECT message_id, COUNT(*) as count
              FROM message_votes
              WHERE vote_type = 'DOWN'
              GROUP BY message_id
            ) down_votes ON m.id = down_votes.message_id`
      );
  }
}

export class MessageRepository {
  constructor(
    private em: EntityManager
  ) {
  }

  buildQuery(filters?: MessageFilters, loadOptions?: LoadOptions) {
    const qb = new MessageQueryBuilder(filters).from('messages m').selectAll();

    if (filters?.room) {
      qb.and('m.room_id = ' + qb.getCurrentParamIndex()).addParam(filters.room);
    }

    if (filters?.exclude?.length) {
      qb.and('m.id NOT IN (' + qb.getCurrentParamIndex() + ')').addParam(filters.exclude);
    }

    // if (loadOptions?.likesCount) {
    //   qb.leftJoin(`reaction mr ON mr.message_id = message.id AND mr.type = '${ReactionType.LIKE}'`)
    //     .addSelect('COUNT(mr.id) as "likesCount"');
    //
    //   this.getAllColumns().forEach(col => qb.addGroupBy('message.' + col));
    // }

    if (loadOptions?.author) {
      qb.join('users u ON u.id = m.user_id')
        .addSelect('u.username as author_name');
    }

    if (loadOptions?.votes) {
      qb.leftJoin('message_votes mv ON mv.message_id = m.id')

        // c'est beau le PSQL :o
        .addSelect(`json_build_object(
            'up', json_agg(mv.user_id) filter (where mv.vote_type = 'UP'),
            'down', json_agg(mv.user_id) filter (where mv.vote_type = 'DOWN')
        ) as votes`)
        .addGroupBy('m.id');

      // c'était faisable aussi comme ça (2 colonnes), mais autant sortir avec le meilleur format possible direct :)
      // .addSelect(`COALESCE(json_agg(mv.user_id) filter (where mv.vote_type = 'UP'), '[]') as upVotes`)
      // .addSelect(`COALESCE(json_agg(mv.user_id) filter (where mv.vote_type = 'DOWN'), '[]') as downVotes`)
    }

    // if (loadOptions?.votes) {
    //   // rien compris, merci l'IA ... :D
    //   qb.addVotesJoins()
    //     .addSelect(`
    //           json_build_object(
    //             'up', COALESCE(up_votes.count, 0),
    //             'down', COALESCE(down_votes.count, 0)
    //           ) as "votesCount"`
    //     ).addGroupBy('m.id, m.created_at, up_votes.count, down_votes.count');
    // }

    return qb;
  }

  async findAll(filters?: MessageFilters, loadOptions?: LoadOptions) {
    const qb = this.buildQuery(filters, loadOptions).addSelect('m.*');

    const rows = (await this.em.query<MessageData>(qb.getQuery(), qb.getParams())).rows;

    return rows.map(row => this.parseRow(row, loadOptions));
  }

  async getCount(filters?: MessageFilters) {
    const qb = this.buildQuery(filters).select('COUNT(*) as count');

    return this.em.query(qb.getQuery(), qb.getParams()).then(res => res.rows[0].count as number);
  }

  parseRow(row: any, loadOptions?: LoadOptions) {
    const parsed = {
      ...row,
      votes: [] as VoteData[]
    } as MessageData;

    if (loadOptions?.votes && row.votes) {
      parsed.votes = [].concat(
        (row.votes.up ?? []).map((v: number) => this.buildVoteData(v, 'UP')),
        (row.votes.down ?? []).map((v: number) => this.buildVoteData(v, 'DOWN'))
      );
    }

    return parsed;
  }

  buildVoteData(user: number, type: VoteType) {
    return {user, type} as VoteData;
  }

  getParamsArray(paramsCount: number, rowCount: number) {
    return new Array(rowCount).fill(1).map((_, i) => {
      return '(' + new Array(paramsCount).fill(1).map((_, j) => '$' + ((i * paramsCount) + (j + 1))).join(', ') + ')'
    }).join(', ');
  }

  async saveMessages(messages: Message[]) {
    if (!messages?.length) {
      return Promise.resolve();
    }

    return this.em.transaction(async (client) => {
      const news = messages.filter(m => m.new);

      if (news.length) {
        const insert = `
          INSERT INTO "messages" (id, content, user_id, room_id)
          VALUES
          ${this.getParamsArray(4, news.length)}
        `;

        const params = news.map(m => [m.id, m.content, m.author?.id, m.room?.id]).flat();

        await client.query(insert, params);

        news.forEach(m => m.new = false);
      }

      const allVotes = messages.map(m => m.votes).flat();

      await this.saveVotes(allVotes, client);
    });
  }

  // cradooooo ...
  async saveVotes(votes: Vote[], trans?: PoolClient) {
    const handle = async (trans: PoolClient) => {
      const news = votes.filter(v => v.new);

      if (news.length) {
        const insert = `INSERT INTO message_votes (message_id, user_id, vote_type)
        VALUES
        ${this.getParamsArray(3, news.length)}`;
        const insertParams = news.map(v => [v.message.id, v.user.id, v.type]).flat();

        await trans.query(insert, insertParams);
      }

      // ne pas oublier de dire qu'ils ne sont plus nouveaux :)
      news.forEach(v => v.new = false);

      const edited = votes.filter(v => v.edited);

      await Promise.all(edited.map(async (v) => {
        const sql = `UPDATE message_votes
                     SET vote_type = $1
                     WHERE user_id = $2
                       AND message_id = $3`;
        const params = [v.type, v.user.id, v.message.id];

        return trans.query(sql, params);
      }));

      votes.forEach(v => v.isNew(false).isEdited(false));
    };

    return trans ? handle(trans) : this.em.transaction(async (client) => handle(client));
  }
}
