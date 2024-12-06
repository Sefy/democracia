import { Container } from "./container";
import { ChatService } from "./chat.service";
import { MessageData, MessageId } from "@common/message";
import { BaseFilters } from "../util/query-builder";
import { PublicMessage } from "@common/public";
import { Message } from "../object/message";

const DEFAULT_PAGE_SIZE = 100;
const DEFAULT_MOST_VOTED_SIZE = 5;

const defaultFilters: MessageFilters = {
  count: DEFAULT_PAGE_SIZE
};

export enum ReactionType {
  LIKE = 1,
  DISLIKE = -1
}

export interface MessageFilters extends BaseFilters {
  room?: number;
  exclude?: MessageId[];
}

export interface LoadOptions {
  likesCount?: boolean;
  author?: boolean;
  votes?: boolean;
  // bon ça fait chier le doublon avec les BaseFilters -_-
  // mais j'en ai besoin pour l'appel depuis les Rooms, et j'ai pas de bonne idée ...
  count?: number;
}

export class MessageService {
  constructor(
    private container: Container
  ) {
  }

  async getAll(filters?: MessageFilters, loadOptions?: LoadOptions) {
    filters = Object.assign({}, defaultFilters, filters);

    filters.count = filters.count ? Math.min(filters.count, DEFAULT_PAGE_SIZE) : DEFAULT_PAGE_SIZE;

    return await this.repository.findAll(filters, loadOptions);
  }

  async get(filters?: MessageFilters) {
    return (await this.getAll(filters))[0];
  }

  getCount(filters?: MessageFilters) {
    return this.repository.getCount(filters);
  }

  async getRoomLatest(idRoom: number, loadOptions?: LoadOptions) {
    const activeRoom = this.chatService.getRoom(idRoom);

    const messages = [];

    if (activeRoom) {
      messages.push(...activeRoom.messages);
    }

    const count = loadOptions?.count ?? DEFAULT_PAGE_SIZE;

    messages.push(...(await this.getAll({
      room: idRoom,
      count: count - messages.length,
      sort: 'm.created_at DESC',
      exclude: messages.map(m => m.id)
    }, loadOptions)));

    return messages;
  }

  async getRoomMostVoted(idRoom: number, count = DEFAULT_MOST_VOTED_SIZE) {
    return Promise.resolve([] as any[]);
    // const mostVoted = await this.getAll({sort: '"likesCount" DESC', count, room: idRoom}, {likesCount: true});
    //
    // const activeRoom = this.chatService.getRoom(idRoom);
    //
    // if (activeRoom) {
    //   mostVoted.push(...Array.from(activeRoom.messages).map(msg => this.getPublicMessage(msg)));
    // }
    //
    // return mostVoted.sort((a, b) => (a.likesCount ?? 0) - (b.likesCount ?? 0)).slice(0, count);
  }

  saveMessages(messages: Message[]) {
    return this.repository.saveMessages(messages);
  }

  getPublicMessage(data: MessageData, loadOptions?: LoadOptions) {
    const pub = {
      id: data.id,
      content: data.content,
      date: data.date
    } as PublicMessage;

    if (loadOptions?.votes && data instanceof Message) {
      pub.likesCount = data.likesCount;
    }

    // si on veut le author, on le charge en objet
    if (loadOptions?.author) {
      pub.author = data.author; // en espérant qu'il a bien été chargé comme objet .. (:
    } else {
      pub.author = typeof data.author === 'object' ? data.author.id : data.author;
    }

    return pub;
  }

  get repository() {
    return this.container.em.message;
  }

  get chatService() {
    return this.container.get('chat.service') as ChatService;
  }
}
