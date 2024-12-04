import { EntityManager } from "./entity-manager";
import { QueryBuilder } from "../../util/query-builder";
import { LoadOptions, MessageFilters, ReactionType } from "../message-service";
import { MessageData } from "@common/message";
import { Message } from "../../object/message";

export class MessageRepository {
  constructor(
    private em: EntityManager
  ) {
  }

  // for group by .. x)
  getAllColumns() {
    return ['id', 'message', 'date', 'author_id', 'room_id'];
  }

  buildQuery(filters?: MessageFilters, loadOptions?: LoadOptions) {
    const qb = new QueryBuilder(filters).from('message');

    if (filters?.room) {
      qb.and('message.room_id = ' + qb.getCurrentParamIndex()).addParam(filters.room);
    }

    if (filters?.exclude?.length) {
      qb.and('message.id NOT IN (' + qb.getCurrentParamIndex() + ')').addParam(filters.exclude);
    }

    // @TODO: add 'having likesCount > 0' ?
    if (loadOptions?.likesCount) {
      qb.leftJoin(`reaction mr ON mr.message_id = message.id AND mr.type = '${ReactionType.LIKE}'`)
        .addSelect('COUNT(mr.id) as "likesCount"');

      this.getAllColumns().forEach(col => qb.addGroupBy('message.' + col));
    }

    if (loadOptions?.author) {
      qb.join('user u ON u.id = message.author_id')
        .addSelect('u.username as author_name');
    }

    return qb;
  }

  async findAll(filters?: MessageFilters, loadOptions?: LoadOptions) {
    const qb = this.buildQuery(filters, loadOptions).addSelect('message.*');

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
        INSERT INTO "message" (id, message, date, author_id, room_id)
        VALUES
          ${this.getParamsArray(5, messages.length)}
      `;

      const params = messages.map(m => [m.id, m.message, m.date, m.author?.id, m.room?.id]).flat();

      const result = await client.query(sql, params);

      messages.forEach(m => m.saved = true);

      return result;
    });
  }
}
