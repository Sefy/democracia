import { EntityManager } from "./entity-manager";
import { QueryBuilder, QueryColumnDef } from "../../util/query-builder";
import { LoadOptions, MessageFilters } from "../message-service";
import { MessageData } from "@common/message";
import { Message } from "../../object/message";

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
      // rien compris, merci l'IA ... :D
      qb.addVotesJoins()
        .addSelect(`
              json_build_object(
                'up', COALESCE(up_votes.count, 0),
                'down', COALESCE(down_votes.count, 0)
              ) as votes`
        ).addGroupBy('m.id, m.created_at, up_votes.count, down_votes.count');
    }

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
    return row as MessageData;

    // const parsed = row as Message & PublicMessage;
    //
    // if (parsed.voteCount !== undefined) {
    //   parsed.voteCount = Number(row.likesCount);
    // }
    //
    // if (loadOptions?.author) {
    //   parsed.author = {
    //     id: row.author_id,
    //     username: row.author_name
    //   };
    // }
    //
    // return parsed;
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
      const sql = `
        INSERT INTO "messages" (id, content, user_id, room_id)
        VALUES
        ${this.getParamsArray(4, messages.length)}
      `;

      const params = messages.map(m => [m.id, m.content, m.author?.id, m.room?.id]).flat();

      const result = await client.query(sql, params);

      messages.forEach(m => m.saved = true);

      return result;
    });
  }
}
