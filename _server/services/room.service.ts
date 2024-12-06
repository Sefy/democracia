import { PublicRoom, RoomData, TagData } from "@common/room";
import { Container } from "./container";
import { ChatService } from "./chat.service";
import { UserService } from "./user.service";
import { RoomFilters } from "./db/room-repository";
import { MessageService, LoadOptions as MessageLoadOptions } from "./message-service";
import { Room } from "../object/room";
import { MessageData } from "@common/message";
import { MathUtil } from "../util/math-util";
import { UserData } from "@common/user";
import { TagService } from "./tag.service";

export interface LoadOptions {
  tags?: boolean;
  counts?: boolean;
  users?: boolean;
  messagesOptions?: MessageLoadOptions;
}

const MAX_PAGE_SIZE = 100;

const defaultFilters: RoomFilters = {
  count: MAX_PAGE_SIZE,
  sort: '"trendingScore" DESC'
}

export class RoomService {
  constructor(
    private container: Container
  ) {
  }

  async get(id: number, loadOptions?: LoadOptions) {
    const active = this.chatService.getRoom(id);

    if (active) {
      // @TODO: ok cool, mais y'aura sûrement des cas où on voudra des données différentes (charger les messages ou non ? combien ?)
      return this.getPublicData(active);
    }

    // sinon on charge les données depuis la base => doit récupérer un résultat similaire
    return (await this.getAll({id}, loadOptions))[0];
  }

  async getAll(filters?: RoomFilters, loadOptions?: LoadOptions) {
    filters = Object.assign({}, defaultFilters, filters);

    filters.count = Math.min(filters.count!, MAX_PAGE_SIZE);

    const rooms: (Room|RoomData)[] = (await this.repository.findAll(filters, loadOptions))
      .map(r => this.chatService.getRoom(r.id) ?? r);

    for (const room of rooms) {
      if (room instanceof Room) {
        continue;
      }

      if (loadOptions?.tags) {
        room.tags = await this.tagService.getAll({roomId: room.id});
      }

      if (loadOptions?.messagesOptions) {
        room.messages = await this.messageService.getRoomLatest(room.id, loadOptions.messagesOptions);
        room.mostVoted = await this.messageService.getRoomMostVoted(room.id);
      }
    }

    // bon pour l'instant on laisse comme ça, c'est pas trop mal, mais on pourrait se passer de charger les trucs du dessus si on vérifiait avant ...
    return rooms.map(room => this.getPublicData(room, loadOptions));
  }

  // getMostTrending(count: number, loadOptions?: LoadOptions) {
  //   // @TODO: prendre en prio dans ChatService ! x)
  //   return this.findMany({count, sort: '"trendingScore" DESC'}, loadOptions);
  // }

  search(subject: string) {
    return this.getAll({search: subject});
  }

  getPublicData(r: RoomData, loadOptions?: LoadOptions): PublicRoom {
    const pub = {
      id: r.id,
      title: r.title,
      description: r.description,
      trendingScore: r.trendingScore,
      messagesCount: r.messagesCount,

      lastActive: r.lastActive,
      startedAt: r.startedAt
    } as PublicRoom;

    // @TODO: peut être que si on a loadOptions.users on peut envoyer des author: number
    // @TODO: et le client se débrouille à faire les liens .. ? (évite les messages: [{author: {...}} x 100]

    if (r instanceof Room) {
      pub.isActive = true;
      pub.anonCount = r.anonCount;
      pub.userCount = r.userCount;

      if (loadOptions?.tags) {
        pub.tags = (r.tags ?? []).map(t => t.toPublic());
      }

      if (loadOptions?.messagesOptions) {
        pub.messages = (r.messages ?? []).slice(-(loadOptions.messagesOptions.count ?? 0))
          .map(m => this.messageService.getPublicMessage(m));
        pub.mostVoted = (r.mostVoted ?? []).map(m => this.messageService.getPublicMessage(m));
      }

      if (loadOptions?.users) {
        pub.users = (r.users ?? []).map(u => this.userService.getPublicData(u));
      }
    } else {
      if (loadOptions?.tags) {
        pub.tags = r.tags;
      }

      if (loadOptions?.messagesOptions) {
        pub.messages = ((r.messages ?? []) as MessageData[]).slice(-(loadOptions.messagesOptions.count ?? 0)).map(m => this.messageService.getPublicMessage(m));
        pub.mostVoted = ((r.mostVoted ?? []) as MessageData[]).map(m => this.messageService.getPublicMessage(m));
      }

      if (loadOptions?.users) {
        pub.users = (r.users as UserData[] ?? []).map(u => this.userService.getPublicData(u));
      }
    }

    return pub;
  }

  async createRoom(roomData: RoomData) {
    return this.repository.create(roomData);
  }

  async saveRoom(r: Room) {
    await this.messageService.saveMessages(Array.from(r.messages).filter(m => !m.saved));

    r.messagesCount = await this.messageService.getCount({room: r.id});
    r.trendingScore = this.computeTrendingScore(r);

    return this.repository.update(r);
  }

  computeTrendingScore(room: Room) {
    const messagesScore = room.messagesCount ?? 0; // @TODO : + average time between messages in the last x time (1 hour ?)
    const votesScore = 0; // @TODO: same but for votes
    const favoriteScore = 0; // @TODO: un score basé sur le nombre de "follow" de la room (nombre de gens qui suivent le sujet)
    const activeScore = 0; // @TODO: nombre de gens connectés dans la dernière heure

    // une moyenne, pour alléger le stockage ? :) après on pourrait pondérer les scores ... (* 2 pour le favoris ?)
    return Math.round(MathUtil.sum(messagesScore, votesScore, favoriteScore, activeScore) / 4);
  }

  get repository() {
    return this.container.em.room;
  }

  get messageService() {
    return this.container.get('message.service') as MessageService;
  }

  get chatService() {
    return this.container.get('chat.service') as ChatService;
  }

  get userService() {
    return this.container.get('user.service') as UserService;
  }

  get tagService() {
    return this.container.get('tag.service') as TagService;
  }
}
