import { WebSocketServer } from "ws";
import { RoomData, TagData } from "@common/room";
import { Publishable } from "@common/public";
import { Message } from "./message";
import { User } from "./user";
import { MessageId } from "@common/message";
import { ArrayUtil } from "../util/array-util";
import { AnonData } from "@common/user";

export class Tag implements TagData, Publishable<TagData> {
  id!: number;
  name!: string;
  color?: string;

  constructor(data?: TagData) {
    if (data) {
      Object.assign(this, data);
    }
  }

  toPublic() {
    return {
      id: this.id,
      name: this.name,
      color: this.color
    } as TagData;
  }
}

export class Room implements RoomData {
  id!: number;

  title?: string;
  description?: string;

  // Join data
  tags: Set<Tag> = new Set();
  users: Set<User> = new Set();
  anons: Set<AnonData> = new Set();
  messages: Set<Message> = new Set();
  mostVoted: Set<Message> = new Set();

  // Counts
  // userCount?: number;
  trendingScore?: number;
  messagesCount?: number;

  // Dates
  createdAt?: Date;
  updatedAt?: Date;

  startedAt?: Date = new Date();
  lastActive: Date = new Date();

  socket?: WebSocketServer;

  // est ce qu'on a le droit de faire ça .. ? x)
  get userCount() {
    return this.users.size;
  }

  get anonCount() {
    return this.anons.size;
  }

  constructor(data?: RoomData) {
    if (data) {
      Object.assign(this, data);

      if (data.tags) {
        this.tags = new Set((data.tags as TagData[]).map(t => new Tag(t)));
      }
    }
  }

  getUser(id: number) {
    return ArrayUtil.find(this.users, id);
  }

  addUser(user: User) {
    this.users.add(user);
    return this;
  }

  removeUser(id: number) {
    const exist = this.getUser(id);

    if (exist) {
      this.users.delete(exist);
    }
  }

  findAnon(id: string) {
    return Array.from(this.anons).find(a => a.id === id);
  }

  addAnon(anon: AnonData) {
    if (!this.anons.has(anon)) {
      this.anons.add(anon);
    }
  }

  removeAnon(id: string) {
    const exist = this.findAnon(id);

    if (exist) {
      this.anons.delete(exist);
    }
  }

  getMessage(needle: MessageId) {
    return ArrayUtil.find(this.messages, needle);
  }

  addMessage(message: Message) {
    this.messages.add(message);
    return this;
  }
}
